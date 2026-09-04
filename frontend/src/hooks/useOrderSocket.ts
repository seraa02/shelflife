/**
 * useOrderSocket
 *
 * Opens a WebSocket connection to /ws, authenticates via the JWT cookie
 * (the browser sends it automatically), and subscribes to live status
 * updates for a specific order.
 *
 * Returns the live status string when an update arrives, or null while
 * waiting for the first push.
 *
 * Reconnects with exponential back-off on unexpected disconnects.
 */

import { useEffect, useRef, useState } from 'react';

function getWsBase(): string {
  if (import.meta.env.DEV) {
    // Dev: same host as the Vite dev server, but proxied to backend port 3001
    return 'ws://localhost:3001/ws';
  }
  // Prod: derive from VITE_API_URL (https://…) → replace scheme with wss://
  const apiUrl = import.meta.env.VITE_API_URL ?? 'https://shelflife-api-o62g.onrender.com';
  return apiUrl.replace(/^https?/, (s: string) => (s === 'https' ? 'wss' : 'ws')) + '/ws';
}

const WS_BASE = getWsBase();
const MAX_BACKOFF_MS = 30_000;

export function useOrderSocket(orderId: string | undefined): string | null {
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1_000);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!orderId) return;

    function connect() {
      if (!mountedRef.current) return;

      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        backoffRef.current = 1_000; // reset on successful connect
        ws.send(JSON.stringify({ type: 'subscribe', orderId }));
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string) as {
            type: string;
            orderId?: string;
            status?: string;
          };
          if (
            msg.type === 'order.updated' &&
            msg.orderId === orderId &&
            msg.status
          ) {
            setLiveStatus(msg.status);
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (evt) => {
        // 1000 = normal close (component unmounted), don't reconnect
        if (!mountedRef.current || evt.code === 1000) return;
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      wsRef.current?.close(1000, 'component unmounted');
    };
  }, [orderId]);

  return liveStatus;
}
