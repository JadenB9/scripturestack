import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

/**
 * Health check. Verifies Postgres + Railway ML service are reachable.
 *
 * GET /api/health
 */
export async function GET() {
  const checks: Record<string, { ok: boolean }> = {
    database: { ok: false },
    ml: { ok: false },
  };

  // Postgres
  try {
    await db.execute(sql`select 1`);
    checks.database.ok = true;
  } catch (err) {
    // This endpoint is public, and driver errors name the database host —
    // so the reason goes to the server log, not the response body.
    console.error("health: database check failed", err);
  }

  // Railway ML service
  try {
    const mlUrl = process.env.ML_API_URL;
    if (!mlUrl) throw new Error("ML_API_URL not set");
    const res = await fetch(`${mlUrl.replace(/\/$/, "")}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}`);
    checks.ml.ok = true;
  } catch (err) {
    console.error("health: ml check failed", err);
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks },
    { status: allOk ? 200 : 503 },
  );
}
