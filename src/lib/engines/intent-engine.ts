// ─────────────────────────────────────────────────────────
// Intent Intelligence Engine v1
// Pure functions — no side effects, fully testable
// ─────────────────────────────────────────────────────────

import type {
  IntentCode,
  IntentScore,
  IntentSignal,
  UrgencyLevel,
  PageContext,
  BehavioralSignal,
  Message,
  SessionIntelligence,
} from "@/types";

// ── Intent keyword patterns ───────────────────────────────
const INTENT_PATTERNS: Record<IntentCode, { keywords: string[]; weight: number }> = {
  I8_NEGOTIATIONS: {
    keywords: [
      "negotiat", "supplier increas", "price increase", "podwyżk", "negocj",
      "renegotiat", "supplier pressur", "benchmark", "leverage", "concession",
      "counter offer", "should-cost", "should cost", "cost position",
      "table", "bargain", "tender", "rfq", "rfp",
    ],
    weight: 1.0,
  },
  I1_SAVINGS: {
    keywords: [
      "saving", "cost reduc", "oszczędnoś", "overpay", "too expensive",
      "cheaper", "price too high", "cost cut", "redukcja kosztów",
      "margin", "profit", "spend", "cost optimiz", "efficiency",
    ],
    weight: 0.95,
  },
  I3_SUPPLIER_RISK: {
    keywords: [
      "supplier risk", "ryzyko dostawc", "dependency", "concentration",
      "supplier fail", "single source", "supply chain", "disruption",
      "finansowa dostawc", "financial health", "supplier health",
      "counterparty", "liquidity", "bankrupt",
    ],
    weight: 0.9,
  },
  I2_FORECASTING: {
    keywords: [
      "forecast", "prognoz", "visibility", "spend data", "analytics",
      "dashboard", "report", "kpi", "spend cube", "data", "analityk",
      "reporting", "spend analysis", "kategori", "category spend",
    ],
    weight: 0.85,
  },
  I5_SOURCING: {
    keywords: [
      "procurement function", "transformation", "operating model",
      "sourcing strategy", "category management", "struktura zakupów",
      "procurement team", "capability", "reorganiz", "pmo", "interim",
      "procurement director", "cpо", "transformacja",
    ],
    weight: 0.85,
  },
  I6_EDUCATION: {
    keywords: [
      "training", "workshop", "szkoleni", "workshop", "akademia",
      "develop", "learn", "skill", "competence", "coaching", "mentoring",
      "kurs", "programme", "team development", "edukacj",
    ],
    weight: 0.8,
  },
  I4_DIGITALIZATION: {
    keywords: [
      "digital", "automat", "tool", "software", "platform", "system",
      "erp", "e-procurement", "spendguru", "digitalizacj", "ai",
      "technolog", "integration",
    ],
    weight: 0.75,
  },
  I7_EXPLORATORY: {
    keywords: [
      "what do you", "what does", "how can", "tell me", "explain",
      "co robicie", "czym się zajm", "jak możecie", "more about",
      "services", "usługi", "offer",
    ],
    weight: 0.3, // Low — catch-all
  },
  UNKNOWN: {
    keywords: [],
    weight: 0,
  },
};

// ── Urgency patterns ──────────────────────────────────────
const URGENCY_U1_PATTERNS = [
  "next week", "next month", "soon", "urgent", "asap", "immediately",
  "in days", "in weeks", "upcoming", "scheduled", "w przyszłym miesiącu",
  "za tydzień", "pilne", "natychmiast", "deadline", "due",
];

const URGENCY_U2_PATTERNS = [
  "planning", "considering", "looking to", "working on", "project",
  "this quarter", "this year", "planning to", "w tym roku",
  "rozważamy", "planujemy", "chcemy",
];

// ── Business impact patterns ──────────────────────────────
const HIGH_IMPACT_PATTERNS = [
  "million", "mln", "significant", "critical", "major", "large",
  "strategic", "board", "cfo", "cpo", "executive", "zarząd",
  "duży", "kluczowy", "strategiczny",
];

// ── Core functions ────────────────────────────────────────

/**
 * Score a single message against all intents.
 * Returns signals with weights.
 */
export function extractIntentSignalsFromMessage(
  message: string,
  source: IntentSignal["source"] = "message"
): IntentSignal[] {
  const lower = message.toLowerCase();
  const signals: IntentSignal[] = [];

  for (const [code, config] of Object.entries(INTENT_PATTERNS)) {
    if (code === "UNKNOWN") continue;
    const matchCount = config.keywords.filter((kw) => lower.includes(kw)).length;
    if (matchCount > 0) {
      const weight = Math.min(1, (matchCount / config.keywords.length) * 5 * config.weight);
      signals.push({
        source,
        intentCode: code as IntentCode,
        weight,
        timestamp: Date.now(),
        raw: message.slice(0, 100),
      });
    }
  }

  return signals;
}

/**
 * Extract intent signals from page context.
 */
export function extractIntentSignalsFromPage(page: PageContext): IntentSignal[] {
  const signals: IntentSignal[] = [];

  signals.push({
    source: "page",
    intentCode: page.primaryIntent,
    weight: 0.4,
    timestamp: Date.now(),
  });

  for (const secondary of page.secondaryIntents) {
    signals.push({
      source: "page",
      intentCode: secondary,
      weight: 0.2,
      timestamp: Date.now(),
    });
  }

  return signals;
}

/**
 * Extract intent signals from behavioral signals.
 */
export function extractIntentSignalsFromBehavior(
  signals: BehavioralSignal[],
  pageContext: PageContext
): IntentSignal[] {
  const intentSignals: IntentSignal[] = [];

  for (const signal of signals) {
    if (signal.type === "deep_scroll" || signal.type === "repeated_visit") {
      // Deep engagement on a page → boost its primary intent
      intentSignals.push({
        source: "behavioral",
        intentCode: pageContext.primaryIntent,
        weight: signal.type === "deep_scroll" ? 0.3 : 0.2,
        timestamp: signal.timestamp,
      });
    }
    if (signal.type === "positive_engagement") {
      intentSignals.push({
        source: "behavioral",
        intentCode: pageContext.primaryIntent,
        weight: 0.25,
        timestamp: signal.timestamp,
      });
    }
  }

  return intentSignals;
}

/**
 * Aggregate all intent signals into a final IntentScore.
 */
export function aggregateIntentSignals(signals: IntentSignal[]): IntentScore {
  if (signals.length === 0) {
    return {
      primary: "UNKNOWN",
      primaryConfidence: 0,
      secondary: null,
      secondaryConfidence: 0,
      urgency: "U3",
      businessImpact: "low",
      escalationProbability: 0.1,
      workshopProbability: 0.1,
      signals: [],
    };
  }

  // Aggregate weights per intent
  const aggregated: Record<string, number> = {};
  for (const signal of signals) {
    aggregated[signal.intentCode] = (aggregated[signal.intentCode] ?? 0) + signal.weight;
  }

  // Sort by total weight
  const sorted = Object.entries(aggregated)
    .filter(([code]) => code !== "UNKNOWN")
    .sort(([, a], [, b]) => b - a);

  const maxWeight = sorted[0]?.[1] ?? 0;
  const totalWeight = sorted.reduce((sum, [, w]) => sum + w, 0);

  const primary = (sorted[0]?.[0] as IntentCode) ?? "UNKNOWN";
  const primaryConfidence = Math.min(0.99, maxWeight / Math.max(totalWeight, 1) + maxWeight * 0.3);

  const secondary = sorted[1] ? (sorted[1][0] as IntentCode) : null;
  const secondaryConfidence = secondary ? Math.min(0.8, (sorted[1][1] / totalWeight) * 1.5) : 0;

  return {
    primary,
    primaryConfidence: Math.min(0.99, primaryConfidence),
    secondary,
    secondaryConfidence,
    urgency: "U3", // computed separately
    businessImpact: "low", // computed separately
    escalationProbability: 0,
    workshopProbability: 0,
    signals,
  };
}

/**
 * Compute urgency level from message content + behavioral signals.
 */
export function computeUrgencyLevel(
  messages: Message[],
  behavioralSignals: BehavioralSignal[]
): UrgencyLevel {
  const allText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const u1Match = URGENCY_U1_PATTERNS.some((p) => allText.includes(p));
  const u2Match = URGENCY_U2_PATTERNS.some((p) => allText.includes(p));

  // Behavioral boost: repeated visits → increase urgency
  const repeatedVisit = behavioralSignals.some((s) => s.type === "repeated_visit");

  if (u1Match) return "U1";
  if (u2Match || repeatedVisit) return "U2";
  return "U3";
}

/**
 * Compute business impact from message content.
 */
export function computeBusinessImpact(
  messages: Message[]
): IntentScore["businessImpact"] {
  const allText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const highMatches = HIGH_IMPACT_PATTERNS.filter((p) => allText.includes(p)).length;
  if (highMatches >= 2) return "critical";
  if (highMatches === 1) return "high";
  if (messages.filter((m) => m.role === "user").length >= 3) return "medium";
  return "low";
}

/**
 * Compute escalation probability from full session context.
 */
export function computeEscalationProbability(
  primaryConfidence: number,
  urgency: UrgencyLevel,
  businessImpact: IntentScore["businessImpact"],
  engagementScore: number
): number {
  let score = 0;
  score += primaryConfidence * 30;
  score += urgency === "U1" ? 30 : urgency === "U2" ? 15 : 0;
  score += businessImpact === "critical" ? 25 : businessImpact === "high" ? 15 : businessImpact === "medium" ? 5 : 0;
  score += Math.min(15, engagementScore * 0.15);
  return Math.min(1, score / 100);
}

/**
 * Compute workshop probability.
 */
export function computeWorkshopProbability(
  primary: IntentCode,
  messages: Message[]
): number {
  if (primary === "I6_EDUCATION") return 0.85;
  if (primary === "I8_NEGOTIATIONS") {
    const text = messages.map((m) => m.content.toLowerCase()).join(" ");
    if (text.includes("team") || text.includes("zesp")) return 0.6;
    return 0.3;
  }
  return 0.15;
}

/**
 * Full intent computation pipeline.
 * Combines all signal sources into a unified IntentScore.
 */
export function computeIntentScore(
  messages: Message[],
  pageContext: PageContext,
  behavioralSignals: BehavioralSignal[],
  intelligence: SessionIntelligence
): IntentScore {
  const allSignals: IntentSignal[] = [];

  // From messages
  for (const msg of messages.filter((m) => m.role === "user")) {
    allSignals.push(...extractIntentSignalsFromMessage(msg.content, "message"));
  }

  // From page context
  allSignals.push(...extractIntentSignalsFromPage(pageContext));

  // From behavior
  allSignals.push(...extractIntentSignalsFromBehavior(behavioralSignals, pageContext));

  // Aggregate
  const base = aggregateIntentSignals(allSignals);
  const urgency = computeUrgencyLevel(messages, behavioralSignals);
  const businessImpact = computeBusinessImpact(messages);
  const escalationProbability = computeEscalationProbability(
    base.primaryConfidence,
    urgency,
    businessImpact,
    intelligence.recommendationsShown.length * 10 // proxy for engagement
  );
  const workshopProbability = computeWorkshopProbability(base.primary, messages);

  return {
    ...base,
    urgency,
    businessImpact,
    escalationProbability,
    workshopProbability,
  };
}
