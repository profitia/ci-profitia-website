// ─────────────────────────────────────────────────────────
// CIC Runtime — Recommendation Runtime
// Server-side recommendation scoring, ranking, and sequencing.
// Imports the existing registry but applies server-side
// intelligence: personalization, fatigue, experiment variants.
// ─────────────────────────────────────────────────────────

import { RECOMMENDATION_REGISTRY } from "@/lib/recommendation-registry";
import type { RecommendationCard } from "@/types";
import type {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationItem,
} from "../schemas/recommendation.schema";
import { getCTALabel } from "./multilingual-runtime";

// ── Priority weight map ───────────────────────────────────
const PRIORITY_WEIGHT: Record<RecommendationCard["priority"], number> = {
  HIGHEST: 40,
  HIGH: 30,
  MEDIUM: 20,
  LOW: 10,
};

// ── Scoring function ──────────────────────────────────────
function scoreRecommendation(
  card: RecommendationCard,
  request: RecommendationRequest
): number {
  const { context, history } = request;
  let score = 0;

  // Intent match (0-35)
  if (card.intentFit.includes(context.intent as (typeof card.intentFit)[number])) {
    score += 35 * context.intentConfidence;
  } else {
    const intentMapping: Record<string, string[]> = {
      I1_SAVINGS: ["I8_NEGOTIATIONS"],
      I8_NEGOTIATIONS: ["I1_SAVINGS"],
      I5_SOURCING: ["I1_SAVINGS", "I2_FORECASTING"],
      I3_SUPPLIER_RISK: ["I8_NEGOTIATIONS"],
    };
    const related = intentMapping[context.intent] ?? [];
    const secondaryFit = related.some((i) =>
      card.intentFit.includes(i as (typeof card.intentFit)[number])
    );
    if (secondaryFit) score += 15 * context.intentConfidence;
  }

  // Urgency match (0-20)
  if (card.urgencyFit.includes(context.urgency as (typeof card.urgencyFit)[number])) {
    score += 20;
  }

  // Priority weight (0-40)
  score += PRIORITY_WEIGHT[card.priority];

  // Confidence threshold gate
  if (context.intentConfidence < card.confidenceThreshold) {
    score *= 0.5;
  }

  // Page context bonus: shown on relevant page (0-10)
  if (card.url.includes(context.pageSlug.replace("/services/", ""))) {
    score += 10;
  }

  // Already visited the target page → lower priority (dedup)
  if (context.pagesVisited.includes(card.url)) {
    score *= 0.4;
  }

  // Already shown penalty (-20)
  if (history.recommendationsShown.includes(card.id)) {
    score -= 20;
  }

  // CTA fatigue penalty
  score -= context.ctaFatigue * 5;

  // Executive mode bonus (0-15) — certain cards are executive-first
  const executiveTags = ["ebit", "executive", "cfo", "ceo", "cpo", "roi"];
  const isExecutive =
    context.executiveRole &&
    ["CFO", "CEO", "CPO"].includes(context.executiveRole);
  if (
    isExecutive &&
    card.tags.some((t) => executiveTags.some((et) => t.toLowerCase().includes(et)))
  ) {
    score += 15;
  }

  // Engagement score bonus: more engaged = stronger recommendations
  if (context.engagementScore >= 60) score += 8;
  else if (context.engagementScore >= 30) score += 4;

  return Math.max(0, score);
}

// ── CTA strength decision ─────────────────────────────────
function getCTAStrength(
  urgency: string,
  escalationScore: number
): "soft" | "medium" | "strong" | "urgent" {
  if (urgency === "U1") return "urgent";
  if (urgency === "U2" && escalationScore >= 60) return "strong";
  if (urgency === "U2") return "medium";
  return "soft";
}

// ── Map RecommendationCard to RecommendationItem ──────────
function buildRecommendationItem(
  card: RecommendationCard,
  score: number,
  index: number,
  request: RecommendationRequest
): RecommendationItem {
  const { locale, context } = request;
  const ctaLabel = getCTALabel(card.type === "service" ? "service_order" : "content", locale);

  return {
    id: card.id,
    type: card.type as RecommendationItem["type"],
    title: card.title,
    description: card.description,
    url: card.url,
    score,
    reasoning: `Intent fit: ${card.intentFit.join(", ")} | Priority: ${card.priority} | Urgency fit: ${card.urgencyFit.join(", ")}`,
    intentFit: card.intentFit.join(", "),
    maturityFit: "standard",
    urgencyFit: card.urgencyFit.join(", "),
    ctaLabel: card.cta || ctaLabel,
    ctaType: card.type === "service" ? "service_order" : "content",
    isNew: !context.pagesVisited.includes(card.url),
    isHighlighted: index === 0 && score >= 50,
    isPrimary: index === 0,
    tags: card.tags,
    executiveRelevance: [],
    estimatedValue: undefined,
  };
}

// ── Build primary CTA ─────────────────────────────────────
function buildPrimaryCTA(
  urgency: string,
  locale: "pl" | "en",
  escalationScore: number,
  fatigueLevel: string
): RecommendationResponse["cta"] | null {
  if (fatigueLevel === "high") return null;

  const strength = getCTAStrength(urgency, escalationScore);

  if (urgency === "U1") {
    return {
      id: "CTA-URGENT",
      label: getCTALabel("contact_form", locale),
      url: "/contact",
      type: "contact_form",
      strength,
    };
  }

  if (urgency === "U2" || escalationScore >= 50) {
    return {
      id: "CTA-SPOT",
      label: getCTALabel("spot_analysis", locale),
      url: "/services/analiza-spot",
      type: "spot_analysis",
      strength,
      subtext:
        locale === "pl"
          ? "Diagnoza w 5-10 dni. Bez zobowiązań."
          : "Diagnosis in 5-10 days. No commitment.",
    };
  }

  return {
    id: "CTA-SOFT",
    label: getCTALabel("contact_form", locale),
    url: "/contact",
    type: "contact_form",
    strength,
  };
}

// ── Main recommendation runtime function ──────────────────
export function runRecommendationRuntime(
  request: RecommendationRequest
): RecommendationResponse {
  const { sessionId, locale, context, history, constraints } = request;

  const maxResults = constraints?.maxResults ?? 3;
  const excludeIds = constraints?.excludeIds ?? [];

  // Filter and score all recommendations
  const scored = RECOMMENDATION_REGISTRY.filter(
    (card) => !excludeIds.includes(card.id)
  )
    .map((card) => ({
      card,
      score: scoreRecommendation(card, request),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  const items = scored.map(({ card, score }, i) =>
    buildRecommendationItem(card, score, i, request)
  );

  const [primary = null, secondary = null, ...rest] = items;

  // Fatigue level determination
  const fatigueLevel: "none" | "mild" | "moderate" | "high" =
    context.ctaFatigue >= 5
      ? "high"
      : context.ctaFatigue >= 3
      ? "moderate"
      : context.ctaFatigue >= 2
      ? "mild"
      : "none";

  const executiveMode =
    !!context.executiveRole &&
    ["CFO", "CEO", "CPO"].includes(context.executiveRole);

  const cta = buildPrimaryCTA(
    context.urgency,
    locale,
    context.engagementScore, // proxy for escalation score
    fatigueLevel
  );

  return {
    sessionId,
    primary,
    secondary,
    queue: rest,
    cta,
    rationale: `Scored ${RECOMMENDATION_REGISTRY.length} recommendations. Intent: ${context.intent} (${(context.intentConfidence * 100).toFixed(0)}%). Top score: ${scored[0]?.score?.toFixed(0) ?? 0}.`,
    personalization: {
      applied: !!context.executiveRole,
      executiveMode,
      toneAdapted: false,
      executiveRole: context.executiveRole,
    },
    fatigueStatus: {
      level: fatigueLevel,
      shouldPauseRecommendations: fatigueLevel === "high",
      shouldPauseCTAs: fatigueLevel === "high" || context.ctaFatigue >= 4,
    },
    timestamp: Date.now(),
  };
}
