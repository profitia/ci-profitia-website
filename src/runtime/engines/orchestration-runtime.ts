// ─────────────────────────────────────────────────────────
// CIC Runtime — Orchestration Runtime
// Server-side master orchestrator. Reconstructs AdvisorySession
// from the API request, runs all intelligence engines, applies
// personalization + optimization, and returns OrchestrationResponse.
// ─────────────────────────────────────────────────────────

import { nanoid } from "nanoid";
import type { AdvisorySession, PageContext } from "@/types";
import {
  runAdvisoryOrchestrator,
  serializeDecisionForPrompt,
} from "@/lib/engines/advisory-orchestrator";
import { getPageContext } from "@/lib/page-graph";
import type {
  OrchestrationRequest,
  OrchestrationResponse,
} from "../schemas/orchestration.schema";
import { computePersonalization } from "./personalization-runtime";
import { buildOptimizationOutput } from "./optimization-runtime";
import { buildProcurementContext } from "./procurement-intelligence";
import { resolveLocale } from "./multilingual-runtime";
import { getDeploymentConfig } from "../deployment/deployment-registry";

// ── Session reconstruction ────────────────────────────────
/**
 * Reconstructs a typed AdvisorySession from the flat API request.
 * This allows server-side engine reuse without duplicating types.
 */
function buildSessionFromRequest(
  request: OrchestrationRequest
): AdvisorySession {
  const { locale, pageSlug, messages, sessionState, intelligence } = request;

  const rawPageContext = getPageContext(pageSlug);
  const pageContext: PageContext = rawPageContext;

  return {
    id: request.sessionId,
    locale: locale as "pl" | "en",
    startedAt: Date.now() - (sessionState.journeyStep * 30000), // approximate
    lastActivityAt: Date.now(),
    pageContext,
    messages: messages.map((m, i) => ({
      id: nanoid(),
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: Date.now() - (messages.length - i) * 10000,
      metadata: undefined,
    })),
    state: {
      phase: sessionState.phase as AdvisorySession["state"]["phase"],
      detectedIntent: sessionState.detectedIntent as AdvisorySession["state"]["detectedIntent"],
      intentConfidence: sessionState.intentConfidence,
      urgency: sessionState.urgency as AdvisorySession["state"]["urgency"],
      buyingStage: sessionState.buyingStage as AdvisorySession["state"]["buyingStage"],
      maturity: sessionState.maturity as AdvisorySession["state"]["maturity"],
      journeyId: sessionState.journeyId,
      journeyStep: sessionState.journeyStep,
      escalationReady: sessionState.escalationReady,
      ctaFatigue: sessionState.ctaFatigue,
      engagementScore: sessionState.engagementScore,
    },
    intelligence: {
      pagesVisited: intelligence.pagesVisited as PageContext["slug"][],
      scrollDepth: intelligence.scrollDepth,
      timeOnPage: intelligence.timeOnPage,
      behavioralSignals: intelligence.behavioralSignals.map((s) => ({
        type: s.type as AdvisorySession["intelligence"]["behavioralSignals"][number]["type"],
        pageSlug: s.pageSlug as PageContext["slug"],
        timestamp: s.timestamp,
        metadata: s.metadata,
      })),
      recommendationsShown: intelligence.recommendationsShown,
      ctasShown: intelligence.ctasShown,
      ctaClicked: intelligence.ctaClicked,
    },
  };
}

// ── Main runtime orchestration ────────────────────────────
export function runOrchestrationRuntime(
  request: OrchestrationRequest
): OrchestrationResponse {
  const { sessionId, locale, deploymentId, pageSlug, sessionState, intelligence } =
    request;

  const deployment = getDeploymentConfig(deploymentId);
  const resolvedLocale = resolveLocale(locale, deployment) as "pl" | "en";

  // 1. Reconstruct AdvisorySession
  const session = buildSessionFromRequest(request);

  // 2. Run all intelligence engines (existing local engines)
  const decision = runAdvisoryOrchestrator(session);

  // 3. Build personalization layer
  const personalizationRequest = {
    sessionId,
    locale: resolvedLocale,
    deploymentId,
    signals: {
      maturityPersona: decision.maturity.persona,
      maturityScore: decision.maturity.score,
      intent: decision.intent.primary,
      intentConfidence: decision.intent.primaryConfidence,
      urgency: decision.intent.urgency,
      buyingStage: sessionState.buyingStage,
      engagementScore: sessionState.engagementScore,
      messagesCount: request.messages.length,
      pagesVisited: intelligence.pagesVisited,
      executiveHint: undefined as string | undefined,
      workshopProbability: decision.intent.workshopProbability,
    },
  };

  const personalization = computePersonalization(
    personalizationRequest,
    request.activeExperimentVariants
  );

  // 4. Build optimization layer
  const optimization = buildOptimizationOutput({
    urgency: decision.intent.urgency,
    escalationScore: decision.routing.escalationScore,
    shouldEscalateNow: decision.routing.shouldEscalateNow,
    ctaFatigue: sessionState.ctaFatigue,
    engagementScore: sessionState.engagementScore,
    messagesCount: request.messages.length,
    intentConfidence: decision.intent.primaryConfidence,
    fatigueLevel: decision.fatigue.level,
  });

  // 5. Build system prompt context (existing serialization + procurement intelligence)
  const baseContext = serializeDecisionForPrompt(decision);
  const procurementContext = buildProcurementContext(
    decision.intent.primary,
    resolvedLocale
  );
  const personalizationContext = personalization.executiveProfile.messagingAngle
    ? `\nEXECUTIVE MESSAGING ANGLE: ${personalization.executiveProfile.messagingAngle}`
    : "";

  const systemPromptContext = [
    baseContext,
    procurementContext ? `\n${procurementContext}` : "",
    personalizationContext,
  ]
    .filter(Boolean)
    .join("\n");

  // 6. Build recommendation response
  const primaryRec = decision.recommendations.topRecommendations[0] ?? null;
  const queueRecs = decision.recommendations.topRecommendations.slice(1);

  return {
    sessionId,

    intent: {
      primary: decision.intent.primary,
      secondary: decision.intent.secondary ?? undefined,
      primaryConfidence: decision.intent.primaryConfidence,
      urgency: decision.intent.urgency,
      urgencyScore: decision.routing.escalationScore,
      workshopProbability: decision.intent.workshopProbability,
      escalationProbability: decision.intent.escalationProbability,
    },

    maturity: {
      persona: decision.maturity.persona,
      level: decision.maturity.level,
      score: decision.maturity.score,
      confidence: decision.maturity.confidence,
      tone: decision.maturity.tone,
      shouldEducate: decision.maturity.shouldEducate,
      shouldEscalate: decision.maturity.shouldEscalate,
    },

    routing: {
      shouldEscalateNow: decision.routing.shouldEscalateNow,
      escalationScore: decision.routing.escalationScore,
      reason: decision.routing.reason,
      shouldShowRecommendation: decision.routing.shouldShowRecommendation,
      nextStep: decision.routing.nextStep
        ? {
            stepIndex: decision.routing.nextStep.stepIndex,
            type: decision.routing.nextStep.type,
            action: decision.routing.nextStep.content ?? "",
          }
        : null,
    },

    recommendations: {
      primary: primaryRec
        ? {
            id: primaryRec.id,
            title: primaryRec.title,
            description: primaryRec.description ?? "",
            url: primaryRec.url,
            type: primaryRec.type,
            priority: primaryRec.priority,
          }
        : null,
      queue: queueRecs.map((r) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        priority: r.priority,
      })),
      shouldShow: decision.recommendations.shouldShow,
      timing: decision.recommendations.timing,
    },

    personalization: {
      executiveRole: personalization.executiveProfile.role,
      advisoryTone: personalization.adaptations.advisoryTone,
      messagingAngle: personalization.executiveProfile.messagingAngle,
      kpis: personalization.executiveProfile.kpis,
    },

    optimization,
    systemPromptContext,
    locale: resolvedLocale,
    deploymentId,
    timestamp: Date.now(),
  };
}
