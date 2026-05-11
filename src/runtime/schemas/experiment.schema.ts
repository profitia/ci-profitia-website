// ─────────────────────────────────────────────────────────
// CIC Runtime — Experiment Schema
// Request/Response contract for POST /api/runtime/experiment
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── Experiment variants ───────────────────────────────────
export const ExperimentVariantSchema = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number().min(0).max(1), // allocation probability
  payload: z.record(z.unknown()).optional(),
});

export type ExperimentVariant = z.infer<typeof ExperimentVariantSchema>;

// ── Experiment definition ─────────────────────────────────
export const ExperimentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "prompt",
    "cta",
    "escalation",
    "recommendation",
    "executive_messaging",
    "advisory_journey",
    "widget",
  ]),
  status: z.enum(["active", "paused", "completed"]),
  variants: z.array(ExperimentVariantSchema),
  // Targeting: only allocate to sessions matching these
  targeting: z
    .object({
      locales: z.array(z.string()).optional(),
      maturityPersonas: z.array(z.string()).optional(),
      intents: z.array(z.string()).optional(),
      urgencies: z.array(z.string()).optional(),
      deploymentIds: z.array(z.string()).optional(),
      newSessionsOnly: z.boolean().optional(),
    })
    .optional(),
});

export type ExperimentDefinition = z.infer<typeof ExperimentDefinitionSchema>;

// ── Allocation result ─────────────────────────────────────
export const ExperimentAllocationSchema = z.object({
  experimentId: z.string(),
  experimentName: z.string(),
  variantId: z.string(),
  variantLabel: z.string(),
  payload: z.record(z.unknown()).optional(),
  allocatedAt: z.number(),
});

export type ExperimentAllocation = z.infer<typeof ExperimentAllocationSchema>;

// ── Request ───────────────────────────────────────────────
export const ExperimentRequestSchema = z.object({
  sessionId: z.string(),
  deploymentId: z.string().default("ci-profitia-website"),

  context: z.object({
    locale: z.enum(["pl", "en"]),
    maturityPersona: z.string(),
    intent: z.string(),
    urgency: z.string(),
    pageSlug: z.string(),
    isNewSession: z.boolean(),
    engagementScore: z.number(),
  }),

  // Already allocated variants (from prior call or persisted session)
  existingAllocations: z.record(z.string()).optional(),
});

export type ExperimentRequest = z.infer<typeof ExperimentRequestSchema>;

// ── Response ──────────────────────────────────────────────
export const ExperimentResponseSchema = z.object({
  sessionId: z.string(),
  allocations: z.array(ExperimentAllocationSchema),
  // Flat map of experimentId → variantId for quick lookup
  variantMap: z.record(z.string()),
  timestamp: z.number(),
});

export type ExperimentResponse = z.infer<typeof ExperimentResponseSchema>;
