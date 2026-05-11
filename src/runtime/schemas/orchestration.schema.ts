// ─────────────────────────────────────────────────────────
// CIC Runtime — Orchestration Schema
// Request/Response contract for POST /api/runtime/orchestrate
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── Request ───────────────────────────────────────────────
export const OrchestrationRequestSchema = z.object({
  sessionId: z.string(),
  locale: z.enum(["pl", "en"]),
  deploymentId: z.string().default("ci-profitia-website"),
  pageSlug: z.string(),

  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),

  sessionState: z.object({
    phase: z.string(),
    detectedIntent: z.string(),
    intentConfidence: z.number(),
    urgency: z.string(),
    buyingStage: z.string(),
    maturity: z.string(),
    engagementScore: z.number(),
    ctaFatigue: z.number(),
    escalationReady: z.boolean(),
    journeyId: z.string().nullable(),
    journeyStep: z.number(),
  }),

  intelligence: z.object({
    pagesVisited: z.array(z.string()),
    scrollDepth: z.record(z.number()),
    timeOnPage: z.record(z.number()),
    behavioralSignals: z.array(
      z.object({
        type: z.string(),
        pageSlug: z.string(),
        timestamp: z.number(),
        metadata: z.record(z.unknown()).optional(),
      })
    ),
    recommendationsShown: z.array(z.string()),
    ctasShown: z.array(z.string()),
    ctaClicked: z.string().nullable(),
  }),

  // Optional: already-allocated experiment variants to include
  activeExperimentVariants: z.record(z.string()).optional(),
});

export type OrchestrationRequest = z.infer<typeof OrchestrationRequestSchema>;

// ── Response ──────────────────────────────────────────────
export const OrchestrationResponseSchema = z.object({
  sessionId: z.string(),

  intent: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    primaryConfidence: z.number(),
    urgency: z.string(),
    urgencyScore: z.number(),
    workshopProbability: z.number(),
    escalationProbability: z.number(),
  }),

  maturity: z.object({
    persona: z.string(),
    level: z.string(),
    score: z.number(),
    confidence: z.number(),
    tone: z.string(),
    shouldEducate: z.boolean(),
    shouldEscalate: z.boolean(),
  }),

  routing: z.object({
    shouldEscalateNow: z.boolean(),
    escalationScore: z.number(),
    reason: z.string(),
    shouldShowRecommendation: z.boolean(),
    nextStep: z
      .object({
        stepIndex: z.number(),
        type: z.string(),
        action: z.string(),
      })
      .nullable(),
  }),

  recommendations: z.object({
    primary: z
      .object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        url: z.string(),
        type: z.string(),
        priority: z.string(),
      })
      .nullable(),
    queue: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        priority: z.string(),
      })
    ),
    shouldShow: z.boolean(),
    timing: z.string(),
  }),

  personalization: z.object({
    executiveRole: z.string(),
    advisoryTone: z.string(),
    messagingAngle: z.string(),
    kpis: z.array(z.string()),
  }),

  optimization: z.object({
    ctaStrength: z.enum(["soft", "medium", "strong", "urgent"]),
    escalationTiming: z.enum(["now", "next_message", "wait"]),
    recommendationPacing: z.enum(["immediate", "after_response", "delayed"]),
    shouldPauseRecommendations: z.boolean(),
    shouldPauseCTAs: z.boolean(),
  }),

  systemPromptContext: z.string(),
  locale: z.enum(["pl", "en"]),
  deploymentId: z.string(),
  timestamp: z.number(),
});

export type OrchestrationResponse = z.infer<typeof OrchestrationResponseSchema>;
