// ─────────────────────────────────────────────────────────
// Advisory State Machine v1
// State transitions, fatigue detection, pacing
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryFatigue,
  AdvisoryFatigueLevel,
  AdvisorySession,
  ConversationPhase,
  RecommendationPacing,
  SessionState,
  StateTransition,
} from "@/types";

// ── Valid phase transitions ───────────────────────────────
const PHASE_TRANSITIONS: Record<ConversationPhase, ConversationPhase[]> = {
  idle: ["opening"],
  opening: ["intent_discovery", "problem_framing"],
  intent_discovery: ["problem_framing", "capability_recommendation"],
  problem_framing: ["capability_recommendation", "objection_handling", "escalation"],
  capability_recommendation: ["objection_handling", "escalation", "post_escalation"],
  objection_handling: ["capability_recommendation", "escalation"],
  escalation: ["post_escalation"],
  post_escalation: ["post_escalation"],
};

// ── State machine core ────────────────────────────────────

/**
 * Compute the next appropriate conversation phase based on full session state.
 * Pure function — no side effects.
 */
export function computeNextPhase(session: AdvisorySession): ConversationPhase {
  const { state, messages, intelligence } = session;
  const userCount = messages.filter((m) => m.role === "user").length;
  const validTransitions = PHASE_TRANSITIONS[state.phase];

  // Escalation conditions
  if (
    state.escalationReady ||
    (state.intentConfidence >= 0.75 && state.urgency === "U1" && userCount >= 2) ||
    (state.engagementScore >= 70 && state.intentConfidence >= 0.7)
  ) {
    return "escalation";
  }

  // Post-escalation
  if (state.phase === "escalation" && intelligence.ctaClicked !== null) {
    return "post_escalation";
  }

  // Capability recommendation
  if (
    state.intentConfidence >= 0.65 &&
    userCount >= 1 &&
    (state.phase === "problem_framing" || state.phase === "intent_discovery")
  ) {
    return "capability_recommendation";
  }

  // Problem framing
  if (state.intentConfidence >= 0.4 && userCount >= 1 && state.phase === "intent_discovery") {
    return "problem_framing";
  }

  // Intent discovery
  if (state.phase === "opening" || (state.phase === "idle" && userCount >= 1)) {
    return "intent_discovery";
  }

  // Opening
  if (state.phase === "idle" && userCount === 0) {
    return "opening";
  }

  // Validate the transition is allowed, otherwise stay
  const currentPhase = state.phase;
  if (validTransitions && validTransitions.length > 0) {
    return currentPhase; // stay in current phase if no clear transition
  }

  return currentPhase;
}

/**
 * Detect advisory fatigue from session state.
 */
export function detectAdvisoryFatigue(session: AdvisorySession): AdvisoryFatigue {
  const { state, intelligence, messages } = session;
  const userCount = messages.filter((m) => m.role === "user").length;
  const recCount = intelligence.recommendationsShown.length;
  const ctaCount = intelligence.ctasShown.length;

  let level: AdvisoryFatigueLevel = "none";

  if (ctaCount >= 3 || recCount >= 5) {
    level = "high";
  } else if (ctaCount >= 2 || recCount >= 3) {
    level = "moderate";
  } else if (ctaCount >= 1 && recCount >= 2) {
    level = "mild";
  }

  // Message count factor
  if (userCount >= 8 && level === "none") {
    level = "mild";
  }
  if (userCount >= 12) {
    level = level === "none" ? "mild" : level === "mild" ? "moderate" : level;
  }

  const shouldPauseRecommendations = level === "high" || (level === "moderate" && recCount >= 4);
  const shouldPauseCTAs = level === "high" || (level === "moderate" && ctaCount >= 2);

  const recoveryAction: AdvisoryFatigue["recoveryAction"] =
    level === "high"
      ? "ask_question"
      : level === "moderate"
      ? "educate"
      : "none";

  return {
    level,
    ctaCount,
    recommendationCount: recCount,
    messageCount: userCount,
    shouldPauseRecommendations,
    shouldPauseCTAs,
    recoveryAction,
  };
}

/**
 * Compute recommendation pacing — when and whether to show next rec.
 */
export function computeRecommendationPacing(
  session: AdvisorySession,
  fatigue: AdvisoryFatigue
): RecommendationPacing {
  const { state, intelligence, messages } = session;
  const userCount = messages.filter((m) => m.role === "user").length;
  const recCount = intelligence.recommendationsShown.length;

  // Hard blocks
  if (fatigue.shouldPauseRecommendations) {
    return {
      canShowRecommendation: false,
      canShowCTA: !fatigue.shouldPauseCTAs,
      delayMs: 0,
      reason: `fatigue_level=${fatigue.level}`,
    };
  }

  if (state.intentConfidence < 0.5) {
    return {
      canShowRecommendation: false,
      canShowCTA: false,
      delayMs: 0,
      reason: `low_confidence=${state.intentConfidence.toFixed(2)}`,
    };
  }

  if (userCount === 0) {
    return {
      canShowRecommendation: false,
      canShowCTA: false,
      delayMs: 0,
      reason: "no_user_messages",
    };
  }

  // Pacing: space out recommendations
  const minMessagesPerRec = 2;
  const expectedMessagesForNextRec = recCount * minMessagesPerRec + 1;
  if (userCount < expectedMessagesForNextRec) {
    return {
      canShowRecommendation: false,
      canShowCTA: state.phase === "capability_recommendation" || state.phase === "escalation",
      delayMs: 1500,
      reason: `pacing — need ${expectedMessagesForNextRec} messages, have ${userCount}`,
    };
  }

  return {
    canShowRecommendation: true,
    canShowCTA: !fatigue.shouldPauseCTAs,
    delayMs: 800,
    reason: "ready",
  };
}

/**
 * Determine if escalation should be triggered now.
 */
export function shouldTriggerEscalation(session: AdvisorySession): boolean {
  const { state, messages, intelligence } = session;
  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    state.escalationReady ||
    (state.intentConfidence >= 0.8 && state.urgency === "U1") ||
    (state.intentConfidence >= 0.75 && userCount >= 3 && state.urgency !== "U3") ||
    (state.engagementScore >= 75 && state.intentConfidence >= 0.65) ||
    intelligence.ctasShown.length === 0 && state.phase === "capability_recommendation" && userCount >= 4
  );
}

/**
 * Build a state transition record.
 */
export function buildStateTransition(
  from: ConversationPhase,
  to: ConversationPhase,
  trigger: string
): StateTransition {
  return { from, to, trigger, timestamp: Date.now() };
}

/**
 * Check if a phase transition is valid.
 */
export function isValidTransition(
  from: ConversationPhase,
  to: ConversationPhase
): boolean {
  return PHASE_TRANSITIONS[from]?.includes(to) ?? false;
}
