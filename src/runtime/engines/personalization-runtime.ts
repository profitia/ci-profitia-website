// ─────────────────────────────────────────────────────────
// CIC Runtime — Personalization Engine
// Maps session signals to executive profile + adaptive config.
// Pure functions — no state, no side effects.
// ─────────────────────────────────────────────────────────

import type { PersonalizeRequest, PersonalizeResponse } from "../schemas/deployment.schema";
import { getDeploymentConfig } from "../deployment/deployment-registry";
import { getCTALabel } from "./multilingual-runtime";

// ── Executive profiles ────────────────────────────────────
interface ExecutiveProfile {
  role: string;
  kpis: string[];
  messagingAngle: string;
  tone: string;
  priorityIntents: string[];
}

const EXECUTIVE_PROFILES: Record<string, ExecutiveProfile> = {
  CFO: {
    role: "CFO",
    kpis: ["EBIT margin", "cash flow", "working capital", "cost of goods sold"],
    messagingAngle:
      "Procurement drives margin. Every 1% savings = 5-10% EBIT improvement. Cost predictability is your lever.",
    tone: "executive",
    priorityIntents: ["I1_SAVINGS", "I3_SUPPLIER_RISK", "I8_NEGOTIATIONS"],
  },
  CEO: {
    role: "CEO",
    kpis: ["EBIT", "revenue growth", "risk", "competitive position"],
    messagingAngle:
      "Procurement is a strategic advantage. Leading companies use it to create margin and market resilience.",
    tone: "executive",
    priorityIntents: ["I5_SOURCING", "I3_SUPPLIER_RISK", "I1_SAVINGS"],
  },
  CPO: {
    role: "CPO",
    kpis: [
      "spend under management",
      "supplier performance",
      "category strategy execution",
    ],
    messagingAngle:
      "Building procurement excellence: from tactical to strategic, from reactive to value-creating.",
    tone: "peer",
    priorityIntents: ["I5_SOURCING", "I4_DIGITALIZATION", "I6_EDUCATION"],
  },
  procurement_director: {
    role: "procurement_director",
    kpis: [
      "savings target",
      "negotiation outcomes",
      "supplier compliance",
      "category coverage",
    ],
    messagingAngle:
      "Fact-based procurement: better data, better negotiations, better results.",
    tone: "strategic",
    priorityIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I2_FORECASTING"],
  },
  category_manager: {
    role: "category_manager",
    kpis: [
      "category savings",
      "supplier count",
      "contract coverage",
      "market share",
    ],
    messagingAngle:
      "Category intelligence: market benchmarks, should-cost, optimal supplier portfolio.",
    tone: "analytical",
    priorityIntents: ["I5_SOURCING", "I8_NEGOTIATIONS", "I1_SAVINGS"],
  },
  general: {
    role: "general",
    kpis: ["cost savings", "procurement performance", "supplier relationships"],
    messagingAngle:
      "Procurement advisory tailored to your specific situation and goals.",
    tone: "diagnostic",
    priorityIntents: ["I7_EXPLORATORY", "I1_SAVINGS", "I5_SOURCING"],
  },
};

// ── Maturity → executive profile mapping ──────────────────
function detectExecutiveRole(
  maturityPersona: string,
  executiveHint?: string
): string {
  if (
    executiveHint &&
    executiveHint !== "general" &&
    EXECUTIVE_PROFILES[executiveHint]
  ) {
    return executiveHint;
  }
  switch (maturityPersona) {
    case "executive_stakeholder":
      return "CEO";
    case "transformation_leader":
      return "CPO";
    case "advanced_analyst":
      return "procurement_director";
    case "strategic_sourcer":
      return "category_manager";
    case "operational_buyer":
      return "general";
    case "reactive_buyer":
      return "general";
    default:
      return "general";
  }
}

// ── Escalation aggression by urgency ─────────────────────
function getEscalationAggression(
  urgency: string,
  engagementScore: number
): "soft" | "standard" | "assertive" {
  if (urgency === "U1") return "assertive";
  if (urgency === "U2" && engagementScore >= 40) return "standard";
  return "soft";
}

// ── Recommendation depth by maturity ─────────────────────
function getRecommendationDepth(
  maturityPersona: string
): "surface" | "standard" | "deep" | "executive" {
  switch (maturityPersona) {
    case "executive_stakeholder":
      return "executive";
    case "transformation_leader":
      return "executive";
    case "advanced_analyst":
      return "deep";
    case "strategic_sourcer":
      return "deep";
    case "operational_buyer":
      return "standard";
    default:
      return "surface";
  }
}

// ── CTA configuration ─────────────────────────────────────
function buildCTAConfig(
  deploymentId: string,
  locale: "pl" | "en",
  urgency: string,
  executiveMode: boolean,
  variantPayload?: Record<string, string>
): PersonalizeResponse["ctaConfig"] {
  const deployment = getDeploymentConfig(deploymentId);
  const baseUrl = deployment.advisory.ctaBaseUrl;

  // Apply experiment variant if present
  const labelKey = `ctaLabel_${locale}`;
  const experimentLabel = variantPayload?.[labelKey];

  if (urgency === "U1") {
    return {
      primaryLabel:
        experimentLabel ??
        getCTALabel("phone", locale),
      primaryUrl: baseUrl,
      primaryType: "phone",
      strength: "urgent",
      secondaryLabel: getCTALabel("contact_form", locale),
      secondaryUrl: baseUrl,
    };
  }

  if (executiveMode || urgency === "U2") {
    return {
      primaryLabel:
        experimentLabel ??
        getCTALabel("contact_form", locale),
      primaryUrl: baseUrl,
      primaryType: "contact_form",
      strength: "strong",
      secondaryLabel: getCTALabel("spot_analysis", locale),
      secondaryUrl: "/services/analiza-spot",
    };
  }

  return {
    primaryLabel:
      experimentLabel ??
      getCTALabel("spot_analysis", locale),
    primaryUrl: "/services/analiza-spot",
    primaryType: "spot_analysis",
    strength: "medium",
  };
}

// ── Main personalization function ─────────────────────────
export function computePersonalization(
  request: PersonalizeRequest,
  experimentVariants?: Record<string, string>
): PersonalizeResponse {
  const { sessionId, locale, deploymentId, signals } = request;
  const {
    maturityPersona,
    urgency,
    engagementScore,
    executiveHint,
    workshopProbability,
  } = signals;

  const executiveRole = detectExecutiveRole(maturityPersona, executiveHint);
  const profile = EXECUTIVE_PROFILES[executiveRole] ?? EXECUTIVE_PROFILES["general"]!;

  const executiveMode =
    executiveRole === "CFO" ||
    executiveRole === "CEO" ||
    executiveRole === "CPO";

  const experimentPayload = experimentVariants as Record<string, string> | undefined;

  return {
    sessionId,

    executiveProfile: {
      role: profile.role,
      kpis: profile.kpis,
      messagingAngle: profile.messagingAngle,
      tone: profile.tone,
      priorityIntents: profile.priorityIntents,
    },

    adaptations: {
      advisoryTone: profile.tone,
      recommendationDepth: getRecommendationDepth(maturityPersona),
      escalationAggression: getEscalationAggression(urgency, engagementScore),
      workshopPromotion: (workshopProbability ?? 0) >= 0.5,
      executiveMode,
      localeVariant:
        locale === "pl"
          ? executiveMode
            ? "pl-executive"
            : "pl-standard"
          : executiveMode
          ? "en-executive"
          : "en-standard",
    },

    ctaConfig: buildCTAConfig(
      deploymentId,
      locale,
      urgency,
      executiveMode,
      experimentPayload
    ),

    timestamp: Date.now(),
  };
}
