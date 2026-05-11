// ─────────────────────────────────────────────────────────
// CIC Runtime — Deployment Schema
// Defines per-deployment configuration contract
// ─────────────────────────────────────────────────────────

import { z } from "zod";

export const DeploymentCapabilitySchema = z.enum([
  "advisory_chat",
  "inline_advisory",
  "contextual_widgets",
  "capability_discovery",
  "adaptive_cta",
  "conversational_navigation",
  "adaptive_page",
  "executive_mode",
  "proactive_triggers",
  "workshop_advisor",
  "negotiation_advisor",
  "benchmark_advisor",
  "supplier_risk_advisor",
  "procurement_hub",
]);

export type DeploymentCapability = z.infer<typeof DeploymentCapabilitySchema>;

export const DeploymentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),

  // Supported locales
  locales: z.array(z.string()),
  defaultLocale: z.string(),

  // Feature flags
  capabilities: z.array(DeploymentCapabilitySchema),

  // LLM configuration per deployment
  llm: z.object({
    model: z.string(),
    temperature: z.number(),
    maxTokens: z.number(),
    streamingEnabled: z.boolean(),
  }),

  // Advisory personality per deployment
  advisory: z.object({
    primaryDomain: z.enum([
      "procurement_advisory",
      "negotiation",
      "benchmarking",
      "supplier_risk",
      "procurement_education",
      "transformation",
    ]),
    persona: z.string(), // e.g. "Senior Procurement Advisor"
    escalationTarget: z.enum([
      "contact_form",
      "calendar",
      "phone",
      "email",
    ]),
    ctaBaseUrl: z.string(),
  }),

  // Analytics
  analytics: z.object({
    enabled: z.boolean(),
    experimentationEnabled: z.boolean(),
    sessionPersistenceEnabled: z.boolean(),
  }),

  // Metadata
  environment: z.enum(["development", "staging", "production"]),
  version: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;

// ── Personalize request/response ─────────────────────────
export const PersonalizeRequestSchema = z.object({
  sessionId: z.string(),
  locale: z.enum(["pl", "en"]),
  deploymentId: z.string().default("ci-profitia-website"),

  signals: z.object({
    maturityPersona: z.string(),
    maturityScore: z.number(),
    intent: z.string(),
    intentConfidence: z.number(),
    urgency: z.string(),
    buyingStage: z.string(),
    engagementScore: z.number(),
    messagesCount: z.number(),
    pagesVisited: z.array(z.string()),
    executiveHint: z.string().optional(),
    workshopProbability: z.number().optional(),
  }),
});

export type PersonalizeRequest = z.infer<typeof PersonalizeRequestSchema>;

export const PersonalizeResponseSchema = z.object({
  sessionId: z.string(),

  executiveProfile: z.object({
    role: z.string(),
    kpis: z.array(z.string()),
    messagingAngle: z.string(),
    tone: z.string(),
    priorityIntents: z.array(z.string()),
  }),

  adaptations: z.object({
    advisoryTone: z.string(),
    recommendationDepth: z.enum(["surface", "standard", "deep", "executive"]),
    escalationAggression: z.enum(["soft", "standard", "assertive"]),
    workshopPromotion: z.boolean(),
    executiveMode: z.boolean(),
    localeVariant: z.string(), // e.g. "pl-formal", "en-executive"
  }),

  ctaConfig: z.object({
    primaryLabel: z.string(),
    primaryUrl: z.string(),
    primaryType: z.string(),
    strength: z.enum(["soft", "medium", "strong", "urgent"]),
    secondaryLabel: z.string().optional(),
    secondaryUrl: z.string().optional(),
  }),

  timestamp: z.number(),
});

export type PersonalizeResponse = z.infer<typeof PersonalizeResponseSchema>;
