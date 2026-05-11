// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/session
// Session intelligence endpoint. Processes behavioral events,
// evaluates proactive triggers, and returns insights.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { SessionRuntimeRequestSchema } from "@/runtime/schemas/session.schema";
import { runSessionRuntime } from "@/runtime/engines/session-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SessionRuntimeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = runSessionRuntime(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[runtime/session] Engine error:", err);
    return NextResponse.json(
      { error: "Session intelligence failed" },
      { status: 500 }
    );
  }
}
