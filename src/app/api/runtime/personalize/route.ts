// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/personalize
// Personalization endpoint. Returns executive profile,
// tone adaptations, and deployment CTA config.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { PersonalizeRequestSchema } from "@/runtime/schemas/deployment.schema";
import { computePersonalization } from "@/runtime/engines/personalization-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PersonalizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = computePersonalization(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[runtime/personalize] Engine error:", err);
    return NextResponse.json(
      { error: "Personalization engine failed" },
      { status: 500 }
    );
  }
}
