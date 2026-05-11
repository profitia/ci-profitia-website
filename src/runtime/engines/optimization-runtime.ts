// ─────────────────────────────────────────────────────────
// CIC Runtime — Optimization Engine
// Optimizes recommendation ordering, CTA timing, escalation
// timing, and advisory path selection.
// Pure functions — no state, no side effects.
// ─────────────────────────────────────────────────────────

import type { OrchestrationResponse } from "../schemas/orchestration.schema";

// ── CTA strength decision ─────────────────────────────────
export function computeCTAStrength(
  urgency: string,
  escalationScore: number,
  ctaFatigue: number,
  engagementScore: number
): "soft" | "medium" | "strong" | "urgent" {
  if (ctaFatigue >= 3) return "soft"; // fatigue — back off
  if (urgency === "U1" || escalationScore >= 80) return "urgent";
  if (urgency === "U2" && engagementScore >= 50) return "strong";
  if (urgency === "U2") return "medium";
  return "soft";
}

// ── Escalation timing ─────────────────────────────────────
export function computeEscalationTiming(
  shouldEscalateNow: boolean,
  escalationScore: number,
  messagesCount: number,
  urgency: string
): "now" | "next_message" | "wait" {
  if (shouldEscalateNow && urgency === "U1") return "now";
  if (escalationScore >= 70 && messagesCount >= 2) return "next_message";
  if (escalationScore >= 50 && urgency === "U2") return "next_message";
  return "wait";
}

// ── Recommendation pacing ─────────────────────────────────
export function computeRecommendationPacing(
  fatigueShouldPause: boolean,
  messagesCount: number,
  ctaFatigue: number,
  intentConfidence: number
): "immediate" | "after_response" | "delayed" {
  if (fatigueShouldPause) return "delayed";
  if (intentConfidence >= 0.7 && messagesCount >= 1) return "immediate";
  if (intentConfidence >= 0.5) return "after_response";
  return "delayed";
}

// ── Journey optimization ──────────────────────────────────
export interface JourneyOptimization {
  recommendedPath: string[]; // ordered recommendation IDs
  skipSteps: string[]; // steps to skip given current maturity
  accelerate: boolean; // skip educational steps for experts
  insertEscalation: boolean; // inject escalation at current position
}

export function optimizeJourney(
  maturityPersona: string,
  urgency: string,
  escalationScore: number,
  recommendationIds: string[]
): JourneyOptimization {
  const isExpert =
    maturityPersona === "advanced_analyst" ||
    maturityPersona === "executive_stakeholder" ||
    maturityPersona === "transformation_leader";

  const skipSteps = isExpert
    ? recommendationIds.filter((id) => id.includes("basic") || id.includes("intro"))
    : [];

  const insertEscalation = escalationScore >= 65 || urgency === "U1";

  const optimized = recommendationIds.filter((id) => !skipSteps.includes(id));

  return {
    recommendedPath: optimized,
    skipSteps,
    accelerate: isExpert,
    insertEscalation,
  };
}

// ── Build optimization output for orchestration response ──
export function buildOptimizationOutput(params: {
  urgency: string;
  escalationScore: number;
  shouldEscalateNow: boolean;
  ctaFatigue: number;
  engagementScore: number;
  messagesCount: number;
  intentConfidence: number;
  fatigueLevel: string;
}): OrchestrationResponse["optimization"] {
  const {
    urgency,
    escalationScore,
    shouldEscalateNow,
    ctaFatigue,
    engagementScore,
    messagesCount,
    intentConfidence,
    fatigueLevel,
  } = params;

  const ctaStrength = computeCTAStrength(urgency, escalationScore, ctaFatigue, engagementScore);
  const escalationTiming = computeEscalationTiming(shouldEscalateNow, escalationScore, messagesCount, urgency);
  const recommendationPacing = computeRecommendationPacing(
    fatigueLevel === "high" || fatigueLevel === "moderate",
    messagesCount,
    ctaFatigue,
    intentConfidence
  );

  return {
    ctaStrength,
    escalationTiming,
    recommendationPacing,
    shouldPauseRecommendations:
      fatigueLevel === "high" || (fatigueLevel === "moderate" && ctaFatigue >= 3),
    shouldPauseCTAs: ctaFatigue >= 4 || fatigueLevel === "high",
  };
}
