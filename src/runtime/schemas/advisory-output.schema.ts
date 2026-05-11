// ─────────────────────────────────────────────────────────
// CIC Runtime — Advisory Output Schema
// Defines the structured output the LLM must return.
// Parsed from the metadata block at the end of each response.
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ── LLM structured metadata block ────────────────────────
export const AdvisoryMetadataSchema = z.object({
  intent: z.string().default("UNKNOWN"),
  confidence: z.number().min(0).max(1).default(0),
  urgency: z.enum(["U1", "U2", "U3"]).default("U3"),
  phase: z.string().default("idle"),
  buyingStage: z.enum(["S1", "S2", "S3", "S4"]).optional(),

  // Detected maturity signals from the conversation
  maturitySignals: z.array(z.string()).optional(),

  // Service recommendations with evidence
  recommendations: z
    .array(
      z.object({
        serviceSlug: z.string(),
        serviceName: z.string(),
        reason: z.string(),
        priority: z.number().int().min(1).max(10),
        url: z.string(),
      })
    )
    .optional(),

  // Primary CTA selection
  cta: z
    .object({
      type: z.enum([
        "contact_form",
        "spot_analysis",
        "workshop",
        "phone",
        "email",
        "service_order",
        "coaching",
        "content",
      ]),
      url: z.string(),
      label: z.string(),
      urgency: z.enum(["U1", "U2", "U3"]),
    })
    .optional(),

  // Escalation signals
  escalation: z
    .object({
      ready: z.boolean(),
      score: z.number().min(0).max(1),
      reason: z.string(),
      suggestedAction: z
        .enum(["contact_form", "calendar", "phone_request", "demo_request"])
        .optional(),
    })
    .optional(),

  // Probability signals
  workshopProbability: z.number().min(0).max(1).optional(),
  discoveryReadiness: z.number().min(0).max(1).optional(),

  // Executive profile detected from conversation
  executiveHint: z
    .enum([
      "CFO",
      "CEO",
      "CPO",
      "procurement_director",
      "category_manager",
      "general",
    ])
    .optional(),

  // Behavioral signals the LLM detected
  behavioralSignals: z.array(z.string()).optional(),

  // Capability IDs for next exploration
  capabilityRecommendations: z.array(z.string()).optional(),

  // What the advisory intelligence should do next
  nextBestAction: z
    .enum([
      "ask_diagnostic",
      "present_capability",
      "recommend_service",
      "escalate",
      "offer_workshop",
      "show_case_study",
      "discuss_roi",
    ])
    .optional(),
});

export type AdvisoryMetadata = z.infer<typeof AdvisoryMetadataSchema>;

// ── Full structured advisory output ──────────────────────
export const StructuredAdvisoryOutputSchema = z.object({
  response: z.string().min(1),
  metadata: AdvisoryMetadataSchema,
});

export type StructuredAdvisoryOutput = z.infer<
  typeof StructuredAdvisoryOutputSchema
>;

// ── Safe metadata parser ──────────────────────────────────
/**
 * Safely parse LLM metadata from the ```metadata block.
 * Returns null if the block is missing or malformed.
 */
export function parseAdvisoryMetadata(
  fullContent: string
): AdvisoryMetadata | null {
  const match = fullContent.match(/```metadata\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[1]);
    const result = AdvisoryMetadataSchema.safeParse(raw);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Strip the metadata block from visible response text.
 */
export function stripMetadataBlock(content: string): string {
  return content.replace(/\n?```metadata[\s\S]*?```\n?/g, "").trim();
}
