// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/recommend
// Server-side recommendation engine endpoint.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { RecommendationRequestSchema } from "@/runtime/schemas/recommendation.schema";
import { runRecommendationRuntime } from "@/runtime/engines/recommendation-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RecommendationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = runRecommendationRuntime(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[runtime/recommend] Engine error:", err);
    return NextResponse.json(
      { error: "Recommendation engine failed" },
      { status: 500 }
    );
  }
}
