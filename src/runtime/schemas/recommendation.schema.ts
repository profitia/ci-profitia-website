// ─────────────────────────────────────────────────────────
// CIC Runtime — Recommendation Schema
// Request/Response contract for POST /api/runtime/recommend
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── Request ───────────────────────────────────────────────
export const RecommendationRequestSchema = z.object({
  sessionId: z.string(),
  locale: z.enum(["pl", "en"]),
  deploymentId: z.string().default("ci-profitia-website"),

  context: z.object({
    intent: z.string(),
    intentConfidence: z.number(),
    urgency: z.string(),
    maturityPersona: z.string(),
    maturityScore: z.number(),
    buyingStage: z.string(),
    pageSlug: z.string(),
    pagesVisited: z.array(z.string()),
    engagementScore: z.number(),
    ctaFatigue: z.number(),
    messagesCount: z.number(),
    executiveRole: z.string().optional(),
  }),

  history: z.object({
    recommendationsShown: z.array(z.string()),
    ctasShown: z.array(z.string()),
    ctaClicked: z.string().nullable(),
  }),

  constraints: z
    .object({
      maxResults: z.number().int().min(1).max(10).default(3),
      excludeIds: z.array(z.string()).optional(),
      requiredTags: z.array(z.string()).optional(),
      forceExecutiveMode: z.boolean().optional(),
    })
    .optional(),

  experimentVariants: z.record(z.string()).optional(),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

// ── Recommendation item ───────────────────────────────────
export const RecommendationItemSchema = z.object({
  id: z.string(),
  type: z.enum([
    "service",
    "workshop",
    "resource",
    "diagnostic",
    "capability",
    "case_study",
  ]),
  title: z.string(),
  description: z.string(),
  url: z.string(),

  // Scoring
  score: z.number().min(0).max(100),
  reasoning: z.string(),

  // Fit signals
  intentFit: z.string(),
  maturityFit: z.string(),
  urgencyFit: z.string(),

  // Display
  ctaLabel: z.string(),
  ctaType: z.string(),
  isNew: z.boolean(),
  isHighlighted: z.boolean(),
  isPrimary: z.boolean(),

  // Metadata
  tags: z.array(z.string()),
  executiveRelevance: z.array(z.string()),
  estimatedValue: z.string().optional(), // "10-20% EBIT improvement"
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

// ── Response ──────────────────────────────────────────────
export const RecommendationResponseSchema = z.object({
  sessionId: z.string(),

  primary: RecommendationItemSchema.nullable(),
  secondary: RecommendationItemSchema.nullable(),
  queue: z.array(RecommendationItemSchema),

  cta: z
    .object({
      id: z.string(),
      label: z.string(),
      url: z.string(),
      type: z.string(),
      strength: z.enum(["soft", "medium", "strong", "urgent"]),
      subtext: z.string().optional(),
    })
    .nullable(),

  rationale: z.string(),

  personalization: z.object({
    applied: z.boolean(),
    executiveMode: z.boolean(),
    toneAdapted: z.boolean(),
    executiveRole: z.string().optional(),
  }),

  fatigueStatus: z.object({
    level: z.enum(["none", "mild", "moderate", "high"]),
    shouldPauseRecommendations: z.boolean(),
    shouldPauseCTAs: z.boolean(),
  }),

  timestamp: z.number(),
});

export type RecommendationResponse = z.infer<
  typeof RecommendationResponseSchema
>;
