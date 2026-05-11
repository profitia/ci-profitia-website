// ─────────────────────────────────────────────────────────
// Advisory Orchestrator
// The single brain that coordinates all 6 intelligence engines
// and outputs a unified AdvisoryDecision.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryDecision,
  AdvisorySession,
  Locale,
  SystemPromptContext,
} from "@/types";
import { computeIntentScore } from "./intent-engine";
import { computeMaturityScore, getMaturitySystemHint } from "./maturity-engine";
import { computeRoutingDecision } from "./routing-engine";
import {
  computeNextPhase,
  detectAdvisoryFatigue,
  computeRecommendationPacing,
  shouldTriggerEscalation,
} from "./advisory-state-machine";
import { evaluateProactiveTriggers } from "./proactive-engine";
import { computeRecommendationDecision } from "./recommendation-intelligence";
import {
  computeSessionHealth,
  aggregateBehavioralPatterns,
  computeAdvisoryReadiness,
} from "./session-intelligence";

// ── Orchestrator ──────────────────────────────────────────

/**
 * Run all intelligence engines and return a unified AdvisoryDecision.
 * This is the single entry point for all advisory intelligence.
 * Pure function — no side effects.
 */
export function runAdvisoryOrchestrator(session: AdvisorySession): AdvisoryDecision {
  const { messages, intelligence, state, pageContext } = session;

  // 1. Intent Intelligence
  const intentScore = computeIntentScore(
    messages,
    pageContext,
    intelligence.behavioralSignals,
    intelligence
  );

  // 2. Maturity Engine
  const maturityScore = computeMaturityScore(
    messages,
    intelligence,
    intentScore.primary
  );

  // 3. Routing Engine
  const routingDecision = computeRoutingDecision(session, intentScore);

  // 4. Advisory State Machine
  const fatigue = detectAdvisoryFatigue(session);
  const pacing = computeRecommendationPacing(session, fatigue);
  const escalationShouldTrigger = shouldTriggerEscalation(session);

  // 5. Proactive Engagement
  const proactiveTrigger = evaluateProactiveTriggers(session);

  // 6. Recommendation Intelligence v2
  const recommendations = computeRecommendationDecision(
    session,
    intentScore,
    maturityScore,
    fatigue
  );

  // 7. Session Intelligence
  const behavioralPattern = aggregateBehavioralPatterns(session);
  const sessionHealth = computeSessionHealth(session, intentScore);
  const advisoryReadiness = computeAdvisoryReadiness(session, sessionHealth, maturityScore);

  // 8. Build System Prompt Context
  const systemPromptContext = buildSystemPromptContext(
    intentScore,
    maturityScore,
    routingDecision,
    escalationShouldTrigger,
    session.locale
  );

  return {
    intent: intentScore,
    maturity: maturityScore,
    routing: routingDecision,
    fatigue,
    pacing,
    proactive: proactiveTrigger,
    recommendations,
    sessionHealth,
    behavioralPattern,
    advisoryReadiness,
    systemPromptContext,
  };
}

// ── System Prompt Context builder ─────────────────────────

import {
  getJourneyForIntent,
} from "./routing-engine";

function buildSystemPromptContext(
  intentScore: ReturnType<typeof computeIntentScore>,
  maturityScore: ReturnType<typeof computeMaturityScore>,
  routing: ReturnType<typeof computeRoutingDecision>,
  shouldEscalate: boolean,
  locale: Locale
): SystemPromptContext {
  const journey = getJourneyForIntent(intentScore.primary);
  const nextStep = routing.nextStep;

  // Recommended services from journey
  const recommendedServices: string[] = [];
  for (const step of journey.steps) {
    if (step.type === "recommendation" && step.content) {
      recommendedServices.push(step.content.split(".")[0] ?? "");
    }
  }

  // Next question from journey
  const nextQuestion = nextStep?.type === "question" ? nextStep.content ?? null : null;

  // Escalation message
  const escalationMessage = shouldEscalate
    ? locale === "pl"
      ? "Następnym krokiem jest krótka rozmowa — bez zobowiązań. Czy możemy umówić 20 minut?"
      : "The next step is a short conversation — no commitment. Can we set up 20 minutes?"
    : null;

  return {
    maturityTone: maturityScore.tone,
    shouldEducate: maturityScore.shouldEducate,
    shouldEscalate,
    escalationUrgency: shouldEscalate
      ? intentScore.urgency === "U1"
        ? "hard"
        : "soft"
      : "none",
    journeyStep: routing.nextStep?.stepIndex ?? 0,
    recommendedServices,
    nextQuestion,
    escalationMessage,
  };
}

/**
 * Serialize the AdvisoryDecision into a compact string for the system prompt.
 * The API route injects this to make the LLM context-aware.
 */
export function serializeDecisionForPrompt(decision: AdvisoryDecision): string {
  const { intent, maturity, routing, systemPromptContext } = decision;

  const lines: string[] = [
    `ADVISORY INTELLIGENCE CONTEXT:`,
    `Intent: ${intent.primary} (confidence: ${(intent.primaryConfidence * 100).toFixed(0)}%, urgency: ${intent.urgency})`,
    `Business impact: ${intent.businessImpact} | Escalation probability: ${(intent.escalationProbability * 100).toFixed(0)}%`,
    `Maturity: ${maturity.persona} (${maturity.level}, score: ${maturity.score}/100)`,
    `Advisory tone: ${systemPromptContext.maturityTone}`,
    `Should educate: ${systemPromptContext.shouldEducate}`,
    `Routing: ${routing.shouldEscalateNow ? "ESCALATE NOW" : routing.shouldAskQuestion ? "ASK QUESTION" : "RECOMMEND"}`,
    `Journey step: ${systemPromptContext.journeyStep}`,
    `Session depth: ${decision.sessionHealth.depth} | Engagement trend: ${decision.sessionHealth.engagementTrend}`,
    `Escalation likelihood: ${(decision.sessionHealth.escalationLikelihood * 100).toFixed(0)}%`,
  ];

  if (systemPromptContext.nextQuestion) {
    lines.push(`Suggested next question: "${systemPromptContext.nextQuestion}"`);
  }

  if (systemPromptContext.escalationMessage) {
    lines.push(`Escalation message to use: "${systemPromptContext.escalationMessage}"`);
  }

  if (decision.fatigue.level !== "none") {
    lines.push(
      `Advisory fatigue: ${decision.fatigue.level} — ${decision.fatigue.recoveryAction}`
    );
  }

  // Maturity-specific system hint
  lines.push("", getMaturitySystemHint(maturity));

  return lines.join("\n");
}
