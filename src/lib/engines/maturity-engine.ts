// ─────────────────────────────────────────────────────────
// Procurement Maturity Engine v1
// Detects buyer persona + adapts advisory tone
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryTone,
  IntentCode,
  MaturityPersona,
  MaturityScore,
  MaturitySignal,
  Message,
  PageSlug,
  ProcurementMaturity,
  SessionIntelligence,
} from "@/types";

// ── Language sophistication patterns ─────────────────────
// Score 0 = reactive, 4 = transformation leader

const MATURITY_SIGNALS: MaturitySignal[] = [
  // Reactive language (score 0–1)
  { type: "language", signal: "too expensive", maturityScore: 0, weight: 1.0 },
  { type: "language", signal: "supplier raised", maturityScore: 0, weight: 1.0 },
  { type: "language", signal: "podwyżka", maturityScore: 0, weight: 1.0 },
  { type: "language", signal: "don't know why", maturityScore: 0, weight: 1.2 },
  { type: "language", signal: "no idea", maturityScore: 0, weight: 1.2 },
  { type: "language", signal: "suddenly", maturityScore: 0, weight: 0.8 },
  { type: "language", signal: "surprised", maturityScore: 0, weight: 0.8 },
  { type: "language", signal: "co się dzieje", maturityScore: 0, weight: 1.0 },

  // Operational language (score 1–2)
  { type: "language", signal: "our process", maturityScore: 1, weight: 0.8 },
  { type: "language", signal: "rfq", maturityScore: 1, weight: 0.9 },
  { type: "language", signal: "tender", maturityScore: 1, weight: 0.9 },
  { type: "language", signal: "nasz proces", maturityScore: 1, weight: 0.8 },
  { type: "language", signal: "purchase order", maturityScore: 1, weight: 0.7 },
  { type: "language", signal: "three quotes", maturityScore: 1, weight: 0.9 },
  { type: "language", signal: "three bids", maturityScore: 1, weight: 0.9 },

  // Analytical language (score 2–3)
  { type: "language", signal: "spend analysis", maturityScore: 2, weight: 1.0 },
  { type: "language", signal: "category", maturityScore: 2, weight: 0.8 },
  { type: "language", signal: "benchmark", maturityScore: 2, weight: 1.0 },
  { type: "language", signal: "should-cost", maturityScore: 2, weight: 1.2 },
  { type: "language", signal: "should cost", maturityScore: 2, weight: 1.2 },
  { type: "language", signal: "spend cube", maturityScore: 2, weight: 1.1 },
  { type: "language", signal: "kpi", maturityScore: 2, weight: 0.9 },
  { type: "language", signal: "dashboard", maturityScore: 2, weight: 0.8 },
  { type: "language", signal: "analityka", maturityScore: 2, weight: 0.9 },
  { type: "language", signal: "data-driven", maturityScore: 2, weight: 1.0 },
  { type: "language", signal: "savings tracking", maturityScore: 2, weight: 1.1 },

  // Strategic language (score 3)
  { type: "language", signal: "category strategy", maturityScore: 3, weight: 1.2 },
  { type: "language", signal: "sourcing strategy", maturityScore: 3, weight: 1.2 },
  { type: "language", signal: "operating model", maturityScore: 3, weight: 1.3 },
  { type: "language", signal: "cpo", maturityScore: 3, weight: 1.3 },
  { type: "language", signal: "procurement excellence", maturityScore: 3, weight: 1.2 },
  { type: "language", signal: "strategic sourcing", maturityScore: 3, weight: 1.2 },
  { type: "language", signal: "savings pipeline", maturityScore: 3, weight: 1.0 },

  // Executive / transformation language (score 4)
  { type: "language", signal: "transformation", maturityScore: 4, weight: 1.3 },
  { type: "language", signal: "board", maturityScore: 4, weight: 1.2 },
  { type: "language", signal: "cfo", maturityScore: 4, weight: 1.2 },
  { type: "language", signal: "group procurement", maturityScore: 4, weight: 1.3 },
  { type: "language", signal: "organizational design", maturityScore: 4, weight: 1.3 },
  { type: "language", signal: "struktury zakupowej", maturityScore: 4, weight: 1.3 },
  { type: "language", signal: "transformacja", maturityScore: 4, weight: 1.2 },
  { type: "language", signal: "enterprise", maturityScore: 4, weight: 1.1 },
  { type: "language", signal: "change management", maturityScore: 4, weight: 1.2 },
  { type: "language", signal: "stakeholder management", maturityScore: 4, weight: 1.2 },
];

// ── High-maturity pages ───────────────────────────────────
const HIGH_MATURITY_PAGES: PageSlug[] = [
  "/services/procurement-transformation",
  "/services/operating-model-design",
  "/services/category-strategy",
  "/services/procurement-pmo",
  "/education/procurement-excellence",
  "/education/strategic-sourcing",
];

const MEDIUM_MATURITY_PAGES: PageSlug[] = [
  "/services/should-cost-analysis",
  "/services/spend-cube",
  "/services/spend-analytics",
  "/services/supplier-intelligence",
  "/services/procurement-kpi-systems",
  "/education/akademia-zakupow",
  "/education/spend-analytics-training",
];

// ── Persona mapping ───────────────────────────────────────
function scoreToPersona(
  score: number,
  intent: IntentCode
): { persona: MaturityPersona; level: ProcurementMaturity } {
  if (score >= 85) {
    return {
      persona: intent === "I5_SOURCING" ? "transformation_leader" : "executive_stakeholder",
      level: "strategic",
    };
  }
  if (score >= 65) {
    return { persona: "strategic_sourcer", level: "strategic" };
  }
  if (score >= 45) {
    return { persona: "advanced_analyst", level: "analytical" };
  }
  if (score >= 25) {
    return { persona: "operational_buyer", level: "operational" };
  }
  return { persona: "reactive_buyer", level: "reactive" };
}

// ── Tone mapping ──────────────────────────────────────────
function personaToTone(persona: MaturityPersona): AdvisoryTone {
  const map: Record<MaturityPersona, AdvisoryTone> = {
    reactive_buyer: "diagnostic",
    operational_buyer: "analytical",
    strategic_sourcer: "strategic",
    advanced_analyst: "analytical",
    executive_stakeholder: "executive",
    transformation_leader: "peer",
    unknown: "diagnostic",
  };
  return map[persona];
}

// ── Core scoring function ─────────────────────────────────
function scoreMessages(messages: Message[]): number {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return 30; // default neutral

  const allText = userMessages.map((m) => m.content.toLowerCase()).join(" ");
  let totalWeight = 0;
  let weightedScore = 0;

  for (const signal of MATURITY_SIGNALS) {
    if (allText.includes(signal.signal)) {
      weightedScore += signal.maturityScore * signal.weight;
      totalWeight += signal.weight;
    }
  }

  if (totalWeight === 0) return 30; // neutral — not enough signals

  const rawScore = weightedScore / totalWeight; // 0–4
  return Math.min(100, rawScore * 25); // normalize to 0–100
}

function scorePages(visitedPages: PageSlug[]): number {
  let pageScore = 30; // baseline
  for (const page of visitedPages) {
    if (HIGH_MATURITY_PAGES.includes(page)) {
      pageScore = Math.min(90, pageScore + 20);
    } else if (MEDIUM_MATURITY_PAGES.includes(page)) {
      pageScore = Math.min(70, pageScore + 10);
    }
  }
  return pageScore;
}

// ── Main export ───────────────────────────────────────────

/**
 * Compute full maturity score from all available signals.
 */
export function computeMaturityScore(
  messages: Message[],
  intelligence: SessionIntelligence,
  primaryIntent: IntentCode
): MaturityScore {
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  const messageScore = scoreMessages(messages);
  const pageScore = scorePages(intelligence.pagesVisited);

  // Weighted blend: messages have priority once we have ≥ 2 user messages
  const weight = userMessageCount >= 2 ? 0.7 : 0.3;
  const blended = messageScore * weight + pageScore * (1 - weight);

  const { persona, level } = scoreToPersona(blended, primaryIntent);
  const tone = personaToTone(persona);
  const confidence = userMessageCount >= 2 ? 0.75 : 0.4;

  // Analytics maturity
  const analyticsMaturity: MaturityScore["analyticsMaturity"] =
    blended >= 70
      ? "advanced"
      : blended >= 50
      ? "intermediate"
      : blended >= 30
      ? "basic"
      : "none";

  // Negotiation sophistication
  const allText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  const negotiationSophistication: MaturityScore["negotiationSophistication"] =
    allText.includes("should-cost") || allText.includes("should cost") || allText.includes("benchmark")
      ? "expert"
      : allText.includes("negotiat") || allText.includes("negocj") || allText.includes("counter")
      ? "experienced"
      : allText.includes("rfq") || allText.includes("tender")
      ? "basic"
      : "none";

  const shouldEducate = level === "reactive" || level === "operational";
  const shouldEscalate = blended >= 65;

  return {
    persona,
    level,
    score: Math.round(blended),
    confidence,
    tone,
    shouldEducate,
    shouldEscalate,
    analyticsMaturity,
    negotiationSophistication,
  };
}

/**
 * Get maturity-appropriate opening statement for the system prompt.
 */
export function getMaturitySystemHint(score: MaturityScore): string {
  switch (score.persona) {
    case "reactive_buyer":
      return "The user appears to be in a reactive situation — they have an immediate problem without a clear framework. Diagnose first. Be empathetic but precise. Explain business consequences clearly without assuming procurement expertise.";
    case "operational_buyer":
      return "The user has basic procurement awareness and process orientation. Use concrete examples and step-by-step logic. Reference their procurement process as a starting point.";
    case "advanced_analyst":
      return "The user is analytics-oriented and data-driven. Lead with data, benchmarks, and spend insights. Use technical terms confidently. Skip basics.";
    case "strategic_sourcer":
      return "The user operates at category strategy / strategic sourcing level. Speak peer-to-peer about category frameworks, benchmarking, and value capture. Use strategic framing.";
    case "executive_stakeholder":
      return "The user is an executive stakeholder (CFO, CEO, CPO-equivalent). Lead with business impact: margin, cash, risk, predictability. Skip tactical details. Focus on outcome and ROI.";
    case "transformation_leader":
      return "The user is driving systemic procurement transformation. Engage as a peer transformation advisor. Discuss organizational design, operating models, and change management directly.";
    default:
      return "Gauge the user's procurement sophistication in your first response. Ask one sharp diagnostic question.";
  }
}
