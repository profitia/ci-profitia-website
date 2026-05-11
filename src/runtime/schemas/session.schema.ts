// ─────────────────────────────────────────────────────────
// CIC Runtime — Session Schema
// Request/Response contract for POST /api/runtime/session
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── Session events (discriminated union) ──────────────────
export const SessionEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    pageSlug: z.string(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("scroll_depth"),
    pageSlug: z.string(),
    depth: z.number().min(0).max(100),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("time_on_page"),
    pageSlug: z.string(),
    ms: z.number().min(0),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("engagement"),
    delta: z.number(),
    source: z.string().optional(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("cta_shown"),
    ctaId: z.string(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("cta_clicked"),
    ctaId: z.string(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("message_sent"),
    messageId: z.string(),
    role: z.enum(["user", "assistant"]),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("recommendation_shown"),
    recommendationId: z.string(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("behavioral_signal"),
    signalType: z.string(),
    pageSlug: z.string(),
    timestamp: z.number(),
    metadata: z.record(z.unknown()).optional(),
  }),
]);

export type SessionEvent = z.infer<typeof SessionEventSchema>;

// ── Request ───────────────────────────────────────────────
export const SessionRuntimeRequestSchema = z.object({
  sessionId: z.string(),
  locale: z.enum(["pl", "en"]),
  deploymentId: z.string().default("ci-profitia-website"),

  event: SessionEventSchema,

  currentState: z.object({
    engagementScore: z.number(),
    ctaFatigue: z.number(),
    pagesVisited: z.array(z.string()),
    scrollDepth: z.record(z.number()),
    timeOnPage: z.record(z.number()),
    messagesCount: z.number(),
    phase: z.string(),
    detectedIntent: z.string(),
    intentConfidence: z.number(),
    urgency: z.string(),
    maturity: z.string(),
  }),
});

export type SessionRuntimeRequest = z.infer<typeof SessionRuntimeRequestSchema>;

// ── Response ──────────────────────────────────────────────
export const SessionRuntimeResponseSchema = z.object({
  sessionId: z.string(),

  insights: z.object({
    engagementTrend: z.enum(["increasing", "stable", "declining"]),
    advisoryReadiness: z.number().min(0).max(100),
    sessionHealth: z.enum(["healthy", "stale", "at_risk", "high_value"]),
    sessionDepth: z.enum(["surface", "engaged", "deep", "committed"]),

    // Proactive trigger signals
    triggerProactive: z.boolean(),
    proactiveType: z.string().nullable(),
    proactiveMessage: z.record(z.string()).nullable(), // {pl, en}

    // Re-orchestration signal
    reRunOrchestration: z.boolean(),
    orchestrationTrigger: z.string().nullable(),

    // Next best action
    nextBestAction: z
      .enum([
        "wait",
        "trigger_proactive",
        "re_orchestrate",
        "show_recommendation",
        "escalate",
        "offer_workshop",
      ])
      .nullable(),
  }),

  memoryUpdate: z.object({
    shouldPersist: z.boolean(),
    signals: z.array(z.string()),
    engagementDelta: z.number(),
  }),

  timestamp: z.number(),
});

export type SessionRuntimeResponse = z.infer<
  typeof SessionRuntimeResponseSchema
>;
