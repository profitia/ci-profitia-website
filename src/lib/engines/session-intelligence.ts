// ─────────────────────────────────────────────────────────
// Session Intelligence Engine v1
// Aggregates behavioral patterns + session health + readiness
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryReadiness,
  AdvisorySession,
  BehavioralPattern,
  BehavioralSignalType,
  IntentScore,
  MaturityScore,
  SessionDepth,
  SessionHealth,
} from "@/types";

// ── Session Depth ─────────────────────────────────────────

/**
 * Classify session depth based on engagement signals.
 */
export function computeSessionDepth(session: AdvisorySession): SessionDepth {
  const { messages, intelligence, state } = session;
  const userCount = messages.filter((m) => m.role === "user").length;
  const pageCount = intelligence.pagesVisited.length;
  const signalCount = intelligence.behavioralSignals.length;

  if (
    userCount >= 4 &&
    intelligence.ctasShown.length >= 1 &&
    state.engagementScore >= 60
  ) {
    return "committed";
  }

  if (userCount >= 2 && (pageCount >= 3 || signalCount >= 2 || state.engagementScore >= 40)) {
    return "deep";
  }

  if (userCount >= 1 || pageCount >= 2 || signalCount >= 1) {
    return "engaged";
  }

  return "surface";
}

// ── Engagement trend ──────────────────────────────────────

/**
 * Determine if engagement is growing, stable, or declining.
 */
function computeEngagementTrend(
  session: AdvisorySession
): SessionHealth["engagementTrend"] {
  const { messages, intelligence } = session;
  const userMessages = messages.filter((m) => m.role === "user");

  if (userMessages.length < 2) return "stable";

  // Look at recent signals — if there's inactivity at the end, trend is declining
  const recent = intelligence.behavioralSignals.slice(-3);
  const hasRecentInactivity = recent.some((s) => s.type === "inactivity");
  const hasRecentPositive = recent.some((s) => s.type === "positive_engagement" || s.type === "deep_scroll");

  if (hasRecentInactivity && !hasRecentPositive) return "declining";
  if (hasRecentPositive) return "growing";
  return "stable";
}

// ── Session Health ────────────────────────────────────────

/**
 * Full session health assessment.
 */
export function computeSessionHealth(
  session: AdvisorySession,
  intentScore: IntentScore
): SessionHealth {
  const depth = computeSessionDepth(session);
  const engagementTrend = computeEngagementTrend(session);
  const { state, intelligence } = session;
  const userCount = session.messages.filter((m) => m.role === "user").length;

  // Escalation likelihood — 0 to 1
  let escalationLikelihood = 0;
  escalationLikelihood += intentScore.primaryConfidence * 0.3;
  escalationLikelihood += intentScore.urgency === "U1" ? 0.35 : intentScore.urgency === "U2" ? 0.15 : 0;
  escalationLikelihood += depth === "committed" ? 0.25 : depth === "deep" ? 0.15 : depth === "engaged" ? 0.05 : 0;
  escalationLikelihood = Math.min(1, escalationLikelihood);

  // Advisory readiness — 0 to 1
  let advisoryReadiness = 0;
  advisoryReadiness += intentScore.primaryConfidence >= 0.7 ? 0.4 : intentScore.primaryConfidence * 0.5;
  advisoryReadiness += userCount >= 3 ? 0.3 : userCount >= 1 ? 0.15 : 0;
  advisoryReadiness += state.engagementScore >= 50 ? 0.2 : state.engagementScore * 0.004;
  advisoryReadiness += intelligence.pagesVisited.length >= 3 ? 0.1 : 0;
  advisoryReadiness = Math.min(1, advisoryReadiness);

  // Intent stability — is the detected intent consistent?
  const intentStable =
    intentScore.primaryConfidence >= 0.65 &&
    (intentScore.secondary === null ||
      intentScore.secondaryConfidence < intentScore.primaryConfidence * 0.7);

  // Conversion probability estimate
  const conversionProbability =
    (escalationLikelihood * 0.5 + advisoryReadiness * 0.3 + (intentStable ? 0.2 : 0)) *
    (engagementTrend === "growing" ? 1.1 : engagementTrend === "declining" ? 0.7 : 1);

  return {
    depth,
    engagementTrend,
    escalationLikelihood: Math.min(1, escalationLikelihood),
    advisoryReadiness: Math.min(1, advisoryReadiness),
    intentStability: intentStable,
    conversionProbability: Math.min(1, conversionProbability),
  };
}

// ── Behavioral Pattern ────────────────────────────────────

/**
 * Aggregate behavioral signals into a coherent pattern.
 */
export function aggregateBehavioralPatterns(
  session: AdvisorySession
): BehavioralPattern {
  const signals = session.intelligence.behavioralSignals;

  const counts: Record<BehavioralSignalType, number> = {
    hesitation: 0,
    deep_scroll: 0,
    repeated_visit: 0,
    cta_avoidance: 0,
    positive_engagement: 0,
    comparison_trigger: 0,
    pricing_hesitation: 0,
    inactivity: 0,
  };

  for (const signal of signals) {
    counts[signal.type] = (counts[signal.type] ?? 0) + 1;
  }

  const dominant = (Object.entries(counts) as [BehavioralSignalType, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  const isComparing =
    counts.comparison_trigger >= 1 ||
    session.intelligence.pagesVisited.filter((p) =>
      typeof p === "string" && p.startsWith("/services/")
    ).length >= 3;

  const isPricingHesitant =
    counts.pricing_hesitation >= 1 || counts.cta_avoidance >= 2;

  return {
    dominantSignal: dominant,
    hesitationCount: counts.hesitation + counts.pricing_hesitation,
    positiveEngagementCount: counts.positive_engagement + counts.deep_scroll,
    inactivityCount: counts.inactivity,
    deepScrollCount: counts.deep_scroll,
    isComparing,
    isPricingHesitant,
  };
}

// ── Advisory Readiness ────────────────────────────────────

/**
 * Compute advisory readiness — is the session ready for a consultant conversation?
 */
export function computeAdvisoryReadiness(
  session: AdvisorySession,
  sessionHealth: SessionHealth,
  maturity: MaturityScore
): AdvisoryReadiness {
  const blockers: string[] = [];
  const accelerators: string[] = [];

  const score = Math.round(
    sessionHealth.advisoryReadiness * 50 +
      sessionHealth.escalationLikelihood * 30 +
      maturity.score * 0.2
  );

  // Blockers
  if (sessionHealth.intentStability === false) {
    blockers.push("intent_unclear");
  }
  if (sessionHealth.engagementTrend === "declining") {
    blockers.push("declining_engagement");
  }
  if (session.state.ctaFatigue >= 3) {
    blockers.push("cta_fatigue");
  }
  if (session.messages.filter((m) => m.role === "user").length === 0) {
    blockers.push("no_user_message");
  }

  // Accelerators
  if (session.state.urgency === "U1") {
    accelerators.push("urgent_timeline");
  }
  if (maturity.persona === "executive_stakeholder" || maturity.persona === "transformation_leader") {
    accelerators.push("senior_stakeholder");
  }
  if (session.intelligence.pagesVisited.length >= 4) {
    accelerators.push("high_page_depth");
  }
  if (sessionHealth.engagementTrend === "growing") {
    accelerators.push("growing_engagement");
  }
  if (session.intelligence.behavioralSignals.some((s) => s.type === "deep_scroll")) {
    accelerators.push("deep_scroll_signal");
  }

  return {
    score: Math.min(100, score),
    isReady: score >= 60 && blockers.length === 0,
    blockers,
    accelerators,
  };
}

/**
 * Compute escalation likelihood (standalone, 0–1).
 */
export function computeEscalationLikelihood(
  session: AdvisorySession,
  intentScore: IntentScore
): number {
  const health = computeSessionHealth(session, intentScore);
  return health.escalationLikelihood;
}
