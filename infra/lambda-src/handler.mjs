/**
 * Lambda handler — PATCH /orders/{orderId}/status
 *
 * Design choices worth explaining in an interview:
 *
 * 1. Module-scope cache: `pool` and `adminKey` are initialised once per
 *    cold start and reused across warm invocations. SSM round-trips and
 *    pg connection setup only happen when a new execution environment spins up.
 *
 * 2. Secrets via SSM SecureString (not env vars): plaintext never appears in
 *    the Lambda console, CloudTrail records each GetParameter call, and
 *    rotation is a single SSM update rather than a function redeploy.
 *
 * 3. @aws-sdk/client-ssm is NOT listed in package.json because the Node.js
 *    20 Lambda runtime bundles AWS SDK v3 — adding it would just bloat the zip.
 *
 * 4. pg.Pool (max: 2): Lambda instances are single-threaded. Max 2 prevents
 *    connection exhaustion when many instances run concurrently, while still
 *    allowing the keep-alive connection to be reused across warm invocations.
 */

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import pg from "pg";

const { Pool } = pg;
const ssm = new SSMClient({});

// Module-scope — survives across warm invocations
let pool = null;
let adminKey = null;

const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

/**
 * Fetch both secrets from SSM in parallel and initialise the connection pool.
 * Called once per cold start; subsequent invocations skip straight to the query.
 */
async function init() {
  if (pool && adminKey) return;

  const [dbParam, keyParam] = await Promise.all([
    ssm.send(
      new GetParameterCommand({
        Name: process.env.DATABASE_URL_PARAM,
        WithDecryption: true,
      })
    ),
    ssm.send(
      new GetParameterCommand({
        Name: process.env.ADMIN_KEY_PARAM,
        WithDecryption: true,
      })
    ),
  ]);

  adminKey = keyParam.Parameter.Value;

  pool = new Pool({
    connectionString: dbParam.Parameter.Value,
    max: 2,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: { rejectUnauthorized: false }, // required for managed Postgres (Render, RDS, Neon, etc.)
  });
}

/**
 * Build a standard API Gateway v2 response object.
 */
function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  try {
    await init();

    // --- Auth -----------------------------------------------------------
    // API Gateway v2 lowercases header names
    const providedKey = event.headers?.["x-admin-key"] ?? "";
    if (adminKey && providedKey !== adminKey) {
      return response(403, { error: "Forbidden" });
    }

    // --- Parse body -----------------------------------------------------
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return response(400, { error: "Invalid JSON body" });
    }

    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return response(400, {
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // --- DB update -------------------------------------------------------
    // Prisma uses quoted PascalCase table names ("Order", "OrderItem", etc.)
    const orderId = event.pathParameters?.orderId;
    if (!orderId) {
      return response(400, { error: "Missing orderId path parameter" });
    }

    const { rows } = await pool.query(
      `UPDATE "Order"
          SET status = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *`,
      [status, orderId]
    );

    if (rows.length === 0) {
      return response(404, { error: `Order ${orderId} not found` });
    }

    console.log(`Order ${orderId} status updated to ${status}`);
    return response(200, rows[0]);
  } catch (err) {
    console.error("Unhandled error:", err);
    return response(500, { error: "Internal server error" });
  }
}
