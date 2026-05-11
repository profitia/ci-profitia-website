// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/experiment
// Experiment allocation endpoint. Deterministically assigns
// session to experiment variants based on stable hash.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { ExperimentRequestSchema } from "@/runtime/schemas/experiment.schema";
import { allocateExperiments } from "@/runtime/engines/experimentation-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ExperimentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = allocateExperiments(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[runtime/experiment] Engine error:", err);
    return NextResponse.json(
      { error: "Experimentation engine failed" },
      { status: 500 }
    );
  }
}
