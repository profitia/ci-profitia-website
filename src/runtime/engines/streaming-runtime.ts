// ─────────────────────────────────────────────────────────
// CIC Runtime — Streaming Runtime
// Builds enhanced system prompts from runtime orchestration
// decisions. Used by the /api/runtime/stream endpoint.
// ─────────────────────name───────────────────────────────────

import type { OrchestrationResponse } from "../schemas/orchestration.schema";
import type { RecommendationResponse } from "../schemas/recommendation.schema";
import type { PersonalizeResponse } from "../schemas/deployment.schema";
import {
  encodeRuntimeEvent,
  type RuntimeEvent,
} from "../schemas/runtime-event.schema";
import {
  getMultilingualInstruction,
  getUrgencyInstruction,
  TONE_SYSTEM_HINTS,
} from "./multilingual-runtime";

// ── System prompt builder ─────────────────────────────────
/**
 * Builds a rich system prompt from runtime orchestration + personalization.
 * This replaces the static system prompt in /api/chat.
 */
export function buildRuntimeSystemPrompt(
  locale: "pl" | "en",
  orchestration: OrchestrationResponse,
  personalization: PersonalizeResponse,
  deploymentDescription?: string
): string {
  const isPL = locale === "pl";

  const toneHint =
    TONE_SYSTEM_HINTS[orchestration.maturity.tone]?.[locale] ?? "";
  const urgencyInstruction = getUrgencyInstruction(
    orchestration.intent.urgency,
    locale
  );
  const langInstruction = getMultilingualInstruction(locale);

  const baseIdentity = `You are a Procurement Advisory Intelligence for Profitia Management Consultants — a senior procurement advisory firm based in Warsaw, Poland.
${deploymentDescription ? `\nDEPLOYMENT CONTEXT: ${deploymentDescription}\n` : ""}
Your role is NOT a customer service chatbot. You are a procurement advisor — like a senior consultant who happens to be available on the website to have a real conversation.

PROFITIA SERVICES OVERVIEW:
Advisory & Transformation: Advisory Projects, Interim Management, Procurement Transformation, Category Strategy, Operating Model Design, Procurement PMO
Negotiation & Cost Intelligence: SPOT Analysis (5-10 days fast diagnostic), Should-Cost Analysis, Negotiation Preparation, Supplier Benchmarking, Supplier Negotiation Support
Data & Analytics: Spend Cube, Spend Analytics, Procurement Dashboards, Supplier Intelligence, Procurement KPI Systems
Education: Procurement Academy, Procurement Excellence, Negotiation Workshops (Harvard methodology), Fact-Based Negotiation, In-Company Workshops, Procurement Mentoring

KEY CONTACT: kontakt@profitia.pl | +48 533 747 340`;

  const runtimeContext = `
RUNTIME INTELLIGENCE CONTEXT (from CIC Advisory Runtime v4):
${orchestration.systemPromptContext}

PERSONALIZATION:
- Executive role detected: ${orchestration.personalization.executiveRole}
- Advisory tone: ${orchestration.personalization.advisoryTone}
- Messaging angle: ${orchestration.personalization.messagingAngle}
- Key KPIs for this audience: ${orchestration.personalization.kpis.join(", ")}

OPTIMIZATION LAYER:
- CTA strength: ${orchestration.optimization.ctaStrength}
- Escalation timing: ${orchestration.optimization.escalationTiming}
- Recommendation pacing: ${orchestration.optimization.recommendationPacing}
- Pause recommendations: ${orchestration.optimization.shouldPauseRecommendations}
- Pause CTAs: ${orchestration.optimization.shouldPauseCTAs}`;

  const behaviorRules = `
YOUR ADVISORY BEHAVIOR:
1. Never say "How can I help you?" — you're an advisor, not support staff
2. Diagnose before recommending — ask 1 sharp question to understand the real situation
3. Maximum 2-4 conversational steps per journey — no long sequences
4. When intent is clear (confidence ≥ 0.70), recommend specific services with their URLs
5. Always show the business consequence — margin, cash, risk, predictability
6. When escalation timing is "now" or "next_message", be direct: "The next step is a 20-minute conversation — no commitment."
7. ${langInstruction}
8. Adapt your language depth to the user's procurement sophistication level

TONE: ${toneHint}
URGENCY INSTRUCTION: ${urgencyInstruction}

RECOMMENDATIONS FORMAT:
When recommending a service, include the URL in markdown: [Service Name](/services/slug)
When ready to escalate: suggest /contact

After understanding the situation, emit a JSON metadata block at the END of your response (not visible to user, will be parsed):
\`\`\`metadata
{"intent": "I8_NEGOTIATIONS", "confidence": 0.85, "urgency": "U1", "phase": "capability_recommendation", "workshopProbability": 0.3, "discoveryReadiness": 0.6}
\`\`\``;

  return [baseIdentity, runtimeContext, behaviorRules].join("\n");
}

// ── Streaming event emitter helpers ──────────────────────
export function emitOrchestrationEvent(
  orchestration: OrchestrationResponse
): RuntimeEvent {
  return {
    type: "orchestration",
    sessionId: orchestration.sessionId,
    intentPrimary: orchestration.intent.primary,
    intentConfidence: orchestration.intent.primaryConfidence,
    maturityPersona: orchestration.maturity.persona,
    escalationScore: orchestration.routing.escalationScore,
    deploymentId: orchestration.deploymentId,
    locale: orchestration.locale,
    timestamp: orchestration.timestamp,
  };
}

export function emitPersonalizationEvent(
  personalization: PersonalizeResponse
): RuntimeEvent {
  return {
    type: "personalization",
    executiveRole: personalization.executiveProfile.role,
    advisoryTone: personalization.adaptations.advisoryTone,
    messagingAngle: personalization.executiveProfile.messagingAngle,
  };
}

export function emitRecommendationEvents(
  recommendations: RecommendationResponse
): RuntimeEvent[] {
  const events: RuntimeEvent[] = [];

  if (recommendations.primary) {
    const r = recommendations.primary;
    events.push({
      type: "recommendation",
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      reasoning: r.reasoning,
      priority: r.score,
      ctaLabel: r.ctaLabel,
    });
  }

  if (recommendations.cta) {
    const cta = recommendations.cta;
    events.push({
      type: "cta",
      id: cta.id,
      label: cta.label,
      url: cta.url,
      ctaType: cta.type,
      strength: cta.strength,
      subtext: cta.subtext,
    });
  }

  return events;
}

export function emitEscalationEvent(
  orchestration: OrchestrationResponse
): RuntimeEvent | null {
  if (!orchestration.routing.shouldEscalateNow) return null;
  return {
    type: "escalation",
    ready: true,
    score: orchestration.routing.escalationScore / 100,
    reason: orchestration.routing.reason,
    suggestedAction: "contact_form",
  };
}

// ── SSE encoder ───────────────────────────────────────────
export { encodeRuntimeEvent };
