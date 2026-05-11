// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/orchestrate
// Master orchestration endpoint. Accepts full session state,
// runs all intelligence engines, returns OrchestrationResponse.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { OrchestrationRequestSchema } from "@/runtime/schemas/orchestration.schema";
import { runOrchestrationRuntime } from "@/runtime/engines/orchestration-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrchestrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = runOrchestrationRuntime(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[runtime/orchestrate] Engine error:", err);
    return NextResponse.json(
      { error: "Orchestration engine failed" },
      { status: 500 }
    );
  }
}
