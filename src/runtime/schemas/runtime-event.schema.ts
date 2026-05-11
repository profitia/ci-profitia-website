// ─────────────────────────────────────────────────────────
// CIC Runtime — Runtime Event Schema
// SSE event types emitted by the /api/runtime/stream endpoint.
// Each event is a JSON line: data: {...}\n\n
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── Individual event types ────────────────────────────────
export const RuntimeEventSchema = z.discriminatedUnion("type", [
  // Token streaming — the main LLM text chunks
  z.object({
    type: z.literal("token"),
    content: z.string(),
  }),

  // Advisory metadata — parsed from the metadata block
  z.object({
    type: z.literal("advisory_metadata"),
    intent: z.string(),
    confidence: z.number(),
    urgency: z.string(),
    phase: z.string(),
    buyingStage: z.string().optional(),
  }),

  // Recommendation emitted alongside the response
  z.object({
    type: z.literal("recommendation"),
    id: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string(),
    reasoning: z.string(),
    priority: z.number(),
    ctaLabel: z.string(),
  }),

  // CTA decision
  z.object({
    type: z.literal("cta"),
    id: z.string(),
    label: z.string(),
    url: z.string(),
    ctaType: z.string(),
    strength: z.enum(["soft", "medium", "strong", "urgent"]),
    subtext: z.string().optional(),
  }),

  // Escalation signal
  z.object({
    type: z.literal("escalation"),
    ready: z.boolean(),
    score: z.number(),
    reason: z.string(),
    suggestedAction: z.string().optional(),
  }),

  // Personalization adaptation applied for this response
  z.object({
    type: z.literal("personalization"),
    executiveRole: z.string(),
    advisoryTone: z.string(),
    messagingAngle: z.string(),
  }),

  // Advisory reasoning signals (behind-the-scenes intelligence)
  z.object({
    type: z.literal("advisory_reasoning"),
    maturitySignal: z.string().optional(),
    workshopProbability: z.number().optional(),
    discoveryReadiness: z.number().optional(),
    nextBestAction: z.string().optional(),
    capabilityRecommendations: z.array(z.string()).optional(),
  }),

  // Orchestration decision emitted at the start of each response
  z.object({
    type: z.literal("orchestration"),
    sessionId: z.string(),
    intentPrimary: z.string(),
    intentConfidence: z.number(),
    maturityPersona: z.string(),
    escalationScore: z.number(),
    deploymentId: z.string(),
    locale: z.string(),
    timestamp: z.number(),
  }),

  // Stream complete
  z.object({
    type: z.literal("done"),
  }),

  // Stream error
  z.object({
    type: z.literal("error"),
    message: z.string(),
    code: z.string().optional(),
  }),
]);

export type RuntimeEvent = z.infer<typeof RuntimeEventSchema>;

// ── SSE encoding helper ───────────────────────────────────
export function encodeRuntimeEvent(event: RuntimeEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// ── SSE decoding helper (client-side) ─────────────────────
export function decodeRuntimeEvent(
  line: string
): RuntimeEvent | null {
  if (!line.startsWith("data: ")) return null;
  const payload = line.slice(6);
  if (payload === "[DONE]") return { type: "done" };
  try {
    const raw = JSON.parse(payload);
    const result = RuntimeEventSchema.safeParse(raw);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
