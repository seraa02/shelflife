/**
 * WebSocket connection manager
 *
 * Mirrors the Lambda handler lifecycle from the serverless WebSocket pattern:
 *   onConnect    → authenticate via JWT, register connection
 *   onMessage    → handle { type: 'subscribe', orderId } to watch a specific order
 *   onDisconnect → clean up all subscription maps
 *
 * Outbound:
 *   notifyOrderUpdate(orderId, status) → push to all sockets subscribed to that order
 */

import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { verifyToken } from './jwt';

// ── Types ──────────────────────────────────────────────────────────────────

interface TaggedSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
}

type InboundMessage =
  | { type: 'subscribe'; orderId: string }
  | { type: 'ping' };

// ── State ──────────────────────────────────────────────────────────────────

// orderId → set of subscribed sockets
const orderSubscribers = new Map<string, Set<TaggedSocket>>();

// ── Lifecycle handlers ─────────────────────────────────────────────────────

function onConnect(ws: TaggedSocket, req: IncomingMessage): void {
  // Auth: read JWT from cookie (set by the login endpoint) or ?token= query param
  let token: string | undefined;

  // Parse cookie header without an extra dependency
  const cookies = Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map(s => s.trim().split('='))
      .filter(p => p.length === 2)
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
  if (cookies.token) {
    token = cookies.token;
  } else {
    const url = new URL(req.url ?? '/', 'http://localhost');
    token = url.searchParams.get('token') ?? undefined;
  }

  if (!token) {
    ws.close(1008, 'Missing auth token');
    return;
  }

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    ws.close(1008, 'Invalid or expired token');
    return;
  }

  ws.userId = payload.userId;
  ws.isAlive = true;

  ws.send(JSON.stringify({ type: 'connected', userId: payload.userId }));
  console.log(`[ws] connect  userId=${payload.userId}`);
}

function onMessage(ws: TaggedSocket, raw: string): void {
  let msg: InboundMessage;
  try {
    msg = JSON.parse(raw) as InboundMessage;
  } catch {
    return; // ignore malformed frames
  }

  if (msg.type === 'ping') {
    ws.isAlive = true;
    ws.send(JSON.stringify({ type: 'pong' }));
    return;
  }

  if (msg.type === 'subscribe') {
    const { orderId } = msg;
    if (!orderId) return;

    if (!orderSubscribers.has(orderId)) {
      orderSubscribers.set(orderId, new Set());
    }
    orderSubscribers.get(orderId)!.add(ws);

    ws.send(JSON.stringify({ type: 'subscribed', orderId }));
    console.log(`[ws] subscribe orderId=${orderId} userId=${ws.userId}`);
  }
}

function onDisconnect(ws: TaggedSocket): void {
  // Remove from every order subscription set
  for (const [orderId, sockets] of orderSubscribers.entries()) {
    sockets.delete(ws);
    if (sockets.size === 0) orderSubscribers.delete(orderId);
  }
  console.log(`[ws] disconnect userId=${ws.userId}`);
}

// ── Public broadcast helper ────────────────────────────────────────────────

export function notifyOrderUpdate(orderId: string, status: string): void {
  const sockets = orderSubscribers.get(orderId);
  if (!sockets || sockets.size === 0) return;

  const payload = JSON.stringify({ type: 'order.updated', orderId, status });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
  console.log(`[ws] broadcast orderId=${orderId} status=${status} subscribers=${sockets.size}`);
}

// ── Server factory ─────────────────────────────────────────────────────────

export function createWsServer(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  // Heartbeat: terminate stale connections every 30s
  const heartbeat = setInterval(() => {
    wss.clients.forEach(client => {
      const ws = client as TaggedSocket;
      if (!ws.isAlive) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const tagged = ws as TaggedSocket;
    tagged.isAlive = true;

    tagged.on('pong', () => { tagged.isAlive = true; });

    onConnect(tagged, req);

    // If auth failed, socket is already closed
    if (tagged.readyState !== WebSocket.OPEN) return;

    tagged.on('message', (data) => onMessage(tagged, data.toString()));
    tagged.on('close', () => onDisconnect(tagged));
    tagged.on('error', (err) => {
      console.error('[ws] error', err.message);
      onDisconnect(tagged);
    });
  });

  return wss;
}
