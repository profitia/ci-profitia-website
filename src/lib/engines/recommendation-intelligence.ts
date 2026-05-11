// ─────────────────────────────────────────────────────────
// Recommendation Intelligence v2
// Multi-dimensional scoring, ranking, fatigue prevention
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryFatigue,
  AdvisorySession,
  IntentScore,
  MaturityScore,
  PageContext,
  RecommendationCard,
  RecommendationDecision,
  RecommendationScore,
  UrgencyLevel,
} from "@/types";
import { RECOMMENDATION_REGISTRY } from "@/lib/recommendation-registry";

// ── Scoring weights ───────────────────────────────────────
const WEIGHTS = {
  intent: 35,
  urgency: 20,
  pageContext: 15,
  behavioral: 15,
  maturityFit: 10,
  journeyPosition: 5,
};

// ── Intent match scoring ──────────────────────────────────
function scoreIntentMatch(
  card: RecommendationCard,
  intentScore: IntentScore
): number {
  const primaryMatch = card.intentFit.includes(intentScore.primary) ? 1 : 0;
  const secondaryMatch =
    intentScore.secondary && card.intentFit.includes(intentScore.secondary) ? 0.5 : 0;
  const confBoost = intentScore.primaryConfidence;

  return Math.round((primaryMatch + secondaryMatch) * confBoost * WEIGHTS.intent);
}

// ── Urgency match scoring ─────────────────────────────────
function scoreUrgencyMatch(
  card: RecommendationCard,
  urgency: UrgencyLevel
): number {
  const exactMatch = card.urgencyFit.includes(urgency) ? 1 : 0;
  const adjacentMatch =
    (urgency === "U1" && card.urgencyFit.includes("U2")) ||
    (urgency === "U3" && card.urgencyFit.includes("U2"))
      ? 0.5
      : 0;

  return Math.round((exactMatch + adjacentMatch) * WEIGHTS.urgency);
}

// ── Page context scoring ──────────────────────────────────
function scorePageContext(
  card: RecommendationCard,
  pageContext: PageContext
): number {
  const pageIntentMatch = card.intentFit.includes(pageContext.primaryIntent) ? 1 : 0;
  const secondaryMatch = pageContext.secondaryIntents.some((i) =>
    card.intentFit.includes(i)
  )
    ? 0.4
    : 0;
  // Boost for high-conversion pages
  const tierBoost = pageContext.conversionTier <= 2 ? 0.3 : 0;

  return Math.round((pageIntentMatch + secondaryMatch + tierBoost) * WEIGHTS.pageContext);
}

// ── Behavioral scoring ────────────────────────────────────
function scoreBehavioral(
  card: RecommendationCard,
  session: AdvisorySession
): number {
  let score = 0;
  const { intelligence } = session;

  // Deep scroll on relevant page → boost
  const scrollBoost = intelligence.pagesVisited.some(
    (p) => typeof p === "string" && p.includes(card.url.split("/")[2] ?? "")
  )
    ? 0.5
    : 0;
  score += scrollBoost;

  // Repeated visits → boost high-relevance cards
  const repeatBoost =
    intelligence.pagesVisited.filter((p) => p === session.pageContext.slug).length >= 2
      ? 0.3
      : 0;
  score += repeatBoost;

  // CTA avoidance → don't push hard CTAs
  const hasCTAAvoidance = intelligence.behavioralSignals.some(
    (s) => s.type === "cta_avoidance" || s.type === "pricing_hesitation"
  );
  if (hasCTAAvoidance && card.type === "service") {
    score -= 0.2;
  }

  return Math.round(Math.max(0, score) * WEIGHTS.behavioral);
}

// ── Maturity fit scoring ──────────────────────────────────
function scoreMaturityFit(
  card: RecommendationCard,
  maturity: MaturityScore
): number {
  // Executive and transformation leader care about impact tags
  if (
    (maturity.persona === "executive_stakeholder" ||
      maturity.persona === "transformation_leader") &&
    (card.tags.includes("strategic") || card.tags.includes("transformation"))
  ) {
    return WEIGHTS.maturityFit;
  }

  // Reactive/operational buyers should be routed to diagnostic/educational
  if (
    (maturity.persona === "reactive_buyer" || maturity.persona === "operational_buyer") &&
    (card.type === "education" || card.tags.includes("diagnostic"))
  ) {
    return WEIGHTS.maturityFit;
  }

  // Analytical buyers benefit from data/analytics recommendations
  if (
    maturity.persona === "advanced_analyst" &&
    card.tags.includes("analytics")
  ) {
    return WEIGHTS.maturityFit;
  }

  return Math.round(WEIGHTS.maturityFit * 0.5);
}

// ── Journey position scoring ──────────────────────────────
function scoreJourneyPosition(
  card: RecommendationCard,
  session: AdvisorySession
): number {
  const step = session.state.journeyStep;
  // Earlier steps: prefer lighter/educational recs
  // Later steps: prefer direct service recs
  if (step === 0 && card.type === "education") return WEIGHTS.journeyPosition;
  if (step >= 2 && card.type === "service") return WEIGHTS.journeyPosition;
  return Math.round(WEIGHTS.journeyPosition * 0.5);
}

// ── Fatigue penalty ───────────────────────────────────────
function computeFatiguePenalty(
  card: RecommendationCard,
  shownIds: string[],
  fatigue: AdvisoryFatigue
): number {
  if (shownIds.includes(card.id)) return 100; // already shown — maximal penalty
  if (fatigue.level === "high") return 30;
  if (fatigue.level === "moderate") return 15;
  if (fatigue.level === "mild") return 5;
  return 0;
}

// ── Priority bonus ────────────────────────────────────────
const PRIORITY_BONUS: Record<RecommendationCard["priority"], number> = {
  HIGHEST: 15,
  HIGH: 10,
  MEDIUM: 5,
  LOW: 0,
};

// ── Main scoring function ─────────────────────────────────

/**
 * Score all eligible recommendations for the current session.
 */
export function scoreRecommendations(
  session: AdvisorySession,
  intentScore: IntentScore,
  maturityScore: MaturityScore,
  fatigue: AdvisoryFatigue
): RecommendationScore[] {
  const { intelligence } = session;

  return RECOMMENDATION_REGISTRY.map((card) => {
    const intentScore_ = scoreIntentMatch(card, intentScore);
    const urgencyScore = scoreUrgencyMatch(card, intentScore.urgency);
    const pageContextScore = scorePageContext(card, session.pageContext);
    const behavioralScore = scoreBehavioral(card, session);
    const maturityFit = scoreMaturityFit(card, maturityScore);
    const journeyPositionScore = scoreJourneyPosition(card, session);
    const fatiguePenalty = computeFatiguePenalty(card, intelligence.recommendationsShown, fatigue);
    const priorityBonus = PRIORITY_BONUS[card.priority];

    const rawTotal =
      intentScore_ +
      urgencyScore +
      pageContextScore +
      behavioralScore +
      maturityFit +
      journeyPositionScore +
      priorityBonus;

    const totalScore = Math.max(0, rawTotal - fatiguePenalty);

    return {
      card,
      totalScore,
      intentScore: intentScore_,
      urgencyScore,
      pageContextScore,
      behavioralScore,
      maturityFit,
      journeyPositionScore,
      fatiguepenalty: fatiguePenalty,
    };
  });
}

/**
 * Rank and filter recommendations. Returns top candidates.
 */
export function rankRecommendations(
  scores: RecommendationScore[],
  intentScore: IntentScore,
  limit: number = 3
): RecommendationCard[] {
  return scores
    .filter((s) => {
      // Filter: must meet confidence threshold + not already shown (fatigue penalty kills those)
      return (
        s.totalScore > 0 &&
        s.card.confidenceThreshold <= intentScore.primaryConfidence &&
        s.fatiguepenalty < 100 // not already shown
      );
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map((s) => s.card);
}

/**
 * Full recommendation decision pipeline.
 */
export function computeRecommendationDecision(
  session: AdvisorySession,
  intentScore: IntentScore,
  maturityScore: MaturityScore,
  fatigue: AdvisoryFatigue
): RecommendationDecision {
  const scores = scoreRecommendations(session, intentScore, maturityScore, fatigue);
  const ranked = scores.sort((a, b) => b.totalScore - a.totalScore);
  const topRecommendations = rankRecommendations(scores, intentScore, 2);

  const shouldShow =
    topRecommendations.length > 0 &&
    !fatigue.shouldPauseRecommendations &&
    intentScore.primaryConfidence >= 0.5 &&
    session.messages.filter((m) => m.role === "user").length >= 1;

  const timing: RecommendationDecision["timing"] =
    intentScore.primaryConfidence >= 0.8
      ? "immediate"
      : intentScore.primaryConfidence >= 0.6
      ? "after_response"
      : "delayed";

  const contextualReason =
    topRecommendations.length === 0
      ? "no_eligible_recommendations"
      : fatigue.shouldPauseRecommendations
      ? `fatigue_${fatigue.level}`
      : `top_score=${ranked[0]?.totalScore ?? 0}`;

  return {
    ranked,
    topRecommendations,
    shouldShow,
    timing,
    contextualReason,
  };
}
