// ─────────────────────────────────────────────────────────
// CIC Runtime — Deployment Registry
// Registry of all known CIC deployments with their configs.
// Each deployment is a distinct frontend consumer of the runtime.
// ─────────────────────────────────────────────────────────

import type { DeploymentConfig } from "../schemas/deployment.schema";

// ── Base LLM defaults ─────────────────────────────────────
const BASE_LLM = {
  model: "gpt-4o-mini",
  temperature: 0.35,
  maxTokens: 700,
  streamingEnabled: true,
};

// ── Deployment registry ───────────────────────────────────
const DEPLOYMENTS: Record<string, DeploymentConfig> = {
  // ── 1. CI-Profitia Website (primary) ─────────────────
  "ci-profitia-website": {
    id: "ci-profitia-website",
    name: "Profitia Advisory Website",
    description: "Main Profitia website with embedded advisory intelligence",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "inline_advisory",
      "contextual_widgets",
      "capability_discovery",
      "adaptive_cta",
      "conversational_navigation",
      "adaptive_page",
      "executive_mode",
      "proactive_triggers",
    ],
    llm: BASE_LLM,
    advisory: {
      primaryDomain: "procurement_advisory",
      persona: "Senior Procurement Advisor at Profitia",
      escalationTarget: "contact_form",
      ctaBaseUrl: "/contact",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: true,
      sessionPersistenceEnabled: false, // no backend persistence yet
    },
    environment: "production",
    version: "4.0.0",
    createdAt: 1746921600000, // 2025-11-11
    updatedAt: Date.now(),
  },

  // ── 2. Workshop Assistant (planned) ──────────────────
  "workshop-assistant": {
    id: "workshop-assistant",
    name: "Profitia Workshop Advisory",
    description: "Dedicated negotiation & workshop advisory assistant",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "workshop_advisor",
      "executive_mode",
      "adaptive_cta",
    ],
    llm: { ...BASE_LLM, temperature: 0.3, maxTokens: 600 },
    advisory: {
      primaryDomain: "procurement_education",
      persona: "Procurement Education Specialist",
      escalationTarget: "contact_form",
      ctaBaseUrl: "/education",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: false,
      sessionPersistenceEnabled: false,
    },
    environment: "development",
    version: "4.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ── 3. Negotiation Advisor (planned) ─────────────────
  "negotiation-advisor": {
    id: "negotiation-advisor",
    name: "Profitia Negotiation Advisor",
    description: "Specialised negotiation intelligence and preparation advisor",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "negotiation_advisor",
      "executive_mode",
      "benchmark_advisor",
      "adaptive_cta",
    ],
    llm: { ...BASE_LLM, temperature: 0.25, maxTokens: 800 },
    advisory: {
      primaryDomain: "negotiation",
      persona: "Negotiation Intelligence Specialist",
      escalationTarget: "calendar",
      ctaBaseUrl: "/services/negotiation-preparation",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: false,
      sessionPersistenceEnabled: false,
    },
    environment: "development",
    version: "4.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ── 4. Benchmark Advisor (planned) ───────────────────
  "benchmark-advisor": {
    id: "benchmark-advisor",
    name: "Profitia Benchmark Intelligence",
    description: "Supplier benchmarking and market intelligence advisor",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "benchmark_advisor",
      "executive_mode",
      "adaptive_cta",
    ],
    llm: { ...BASE_LLM, temperature: 0.2 },
    advisory: {
      primaryDomain: "benchmarking",
      persona: "Benchmarking Intelligence Specialist",
      escalationTarget: "contact_form",
      ctaBaseUrl: "/services/supplier-benchmarking",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: false,
      sessionPersistenceEnabled: false,
    },
    environment: "development",
    version: "4.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ── 5. Supplier Risk Advisor (planned) ────────────────
  "supplier-risk-advisor": {
    id: "supplier-risk-advisor",
    name: "Profitia Supplier Risk Intelligence",
    description: "Early warning supplier risk detection and advisory",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "supplier_risk_advisor",
      "executive_mode",
      "adaptive_cta",
    ],
    llm: { ...BASE_LLM, temperature: 0.2, maxTokens: 600 },
    advisory: {
      primaryDomain: "supplier_risk",
      persona: "Supplier Risk Intelligence Specialist",
      escalationTarget: "contact_form",
      ctaBaseUrl: "/services/supplier-intelligence",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: false,
      sessionPersistenceEnabled: false,
    },
    environment: "development",
    version: "4.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ── 6. Procurement Intelligence Hub (planned) ─────────
  "procurement-intelligence-hub": {
    id: "procurement-intelligence-hub",
    name: "Profitia Procurement Intelligence Hub",
    description: "Comprehensive procurement analytics and intelligence platform",
    locales: ["pl", "en"],
    defaultLocale: "pl",
    capabilities: [
      "advisory_chat",
      "inline_advisory",
      "contextual_widgets",
      "capability_discovery",
      "adaptive_cta",
      "executive_mode",
      "procurement_hub",
    ],
    llm: { ...BASE_LLM, temperature: 0.3, maxTokens: 900 },
    advisory: {
      primaryDomain: "procurement_advisory",
      persona: "Procurement Intelligence Platform Advisor",
      escalationTarget: "calendar",
      ctaBaseUrl: "/contact",
    },
    analytics: {
      enabled: true,
      experimentationEnabled: true,
      sessionPersistenceEnabled: false,
    },
    environment: "development",
    version: "4.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ── Registry API ──────────────────────────────────────────
const FALLBACK_ID = "ci-profitia-website";

export function getDeploymentConfig(deploymentId: string): DeploymentConfig {
  return DEPLOYMENTS[deploymentId] ?? DEPLOYMENTS[FALLBACK_ID]!;
}

export function hasCapability(
  deploymentId: string,
  capability: DeploymentConfig["capabilities"][number]
): boolean {
  return getDeploymentConfig(deploymentId).capabilities.includes(capability);
}

export function getAllDeployments(): DeploymentConfig[] {
  return Object.values(DEPLOYMENTS);
}

export function getActiveDeployments(): DeploymentConfig[] {
  return getAllDeployments().filter((d) => d.environment === "production");
}

export function listDeploymentIds(): string[] {
  return Object.keys(DEPLOYMENTS);
}
