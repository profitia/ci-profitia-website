// ─────────────────────────────────────────────────────────
// Conversational Routing Engine v1
// Advisory journey registry + dynamic route scoring
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryRoute,
  AdvisoryRouteStep,
  AdvisorySession,
  CTAType,
  IntentCode,
  IntentScore,
  RoutingDecision,
  SessionState,
} from "@/types";

// ── Journey Registry ──────────────────────────────────────
// Full advisory journeys per intent, ordered by step

const JOURNEY_REGISTRY: Record<IntentCode, AdvisoryRoute> = {
  I8_NEGOTIATIONS: {
    journeyId: "J-NEG-01",
    intent: "I8_NEGOTIATIONS",
    entryPoint: "/services/negotiation-preparation",
    escalationCTA: "contact_form",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "What's the timeline on this negotiation — do you have a deadline, or are you in early preparation?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-NEG-01",
        content:
          "Our Negotiation Preparation service builds your cost position using market data and should-cost modeling, so you enter the table with facts — not just instincts.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-01",
        content:
          "The next step is a 20-minute conversation to assess your specific supplier situation. No commitment.",
      },
    ],
  },

  I1_SAVINGS: {
    journeyId: "J-SAV-01",
    intent: "I1_SAVINGS",
    entryPoint: "/services/analiza-spot",
    escalationCTA: "spot_analysis",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Where is the largest cost pressure right now — specific categories, a supplier, or overall spend visibility?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-SAV-01",
        content:
          "A SPOT Analysis delivers an actionable savings map in 5–10 days — focused on the specific categories where margin is leaking most.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-02",
        content: "Ready to quantify the opportunity? Let's scope a SPOT Analysis together.",
      },
    ],
  },

  I3_SUPPLIER_RISK: {
    journeyId: "J-RISK-01",
    intent: "I3_SUPPLIER_RISK",
    entryPoint: "/services/supplier-intelligence",
    escalationCTA: "contact_form",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Is this about a specific supplier you're concerned about, or broader supply chain concentration risk?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-RISK-01",
        content:
          "Supplier Intelligence monitoring gives you early warning on financial health, market signals, and concentration risk — before a disruption becomes a crisis.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-01",
        content: "The most useful next step is a quick review of your supplier portfolio risk profile.",
      },
    ],
  },

  I2_FORECASTING: {
    journeyId: "J-DATA-01",
    intent: "I2_FORECASTING",
    entryPoint: "/services/spend-analytics",
    escalationCTA: "spot_analysis",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Do you currently have spend categorized at category level, or are you working from raw transactional data?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-DATA-01",
        content:
          "A Spend Cube gives you a clean, categorized spend map — the foundation for savings identification, supplier consolidation, and negotiation leverage.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-02",
        content: "We can start with a SPOT Analysis to quickly map your spend landscape.",
      },
    ],
  },

  I5_SOURCING: {
    journeyId: "J-TRANS-01",
    intent: "I5_SOURCING",
    entryPoint: "/services/procurement-transformation",
    escalationCTA: "contact_form",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Is this a new procurement function build-out, or a transformation of an existing team and process?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-TRANS-01",
        content:
          "Procurement Transformation engagements typically start with operating model diagnosis — understanding what's working, what's not, and where the value gap is.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-01",
        content: "Let's have a scoping conversation — usually 30 minutes is enough to align on approach.",
      },
    ],
  },

  I6_EDUCATION: {
    journeyId: "J-EDU-01",
    intent: "I6_EDUCATION",
    entryPoint: "/education/warsztaty-negocjacyjne",
    escalationCTA: "workshop",
    estimatedSteps: 3,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Is this for a specific team or broader capability development? And is the priority negotiation, analytics, or strategic sourcing?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-EDU-01",
        content:
          "Our Negotiation Workshops (Harvard methodology) are designed for procurement teams who need practical, deal-ready skills — not theory.",
      },
      {
        stepIndex: 2,
        type: "escalation",
        ctaId: "CTA-03",
        content: "We can tailor an in-company programme to your team's specific challenge.",
      },
    ],
  },

  I4_DIGITALIZATION: {
    journeyId: "J-DIG-01",
    intent: "I4_DIGITALIZATION",
    entryPoint: "/services/projekty-doradcze",
    escalationCTA: "contact_form",
    estimatedSteps: 2,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "Are you evaluating tools/platforms, or do you need help with the procurement process design before digitalization?",
      },
      {
        stepIndex: 1,
        type: "escalation",
        ctaId: "CTA-01",
        content:
          "Digitalization projects are most successful when the process is clean first. Let's talk through where you are.",
      },
    ],
  },

  I7_EXPLORATORY: {
    journeyId: "J-EXP-01",
    intent: "I7_EXPLORATORY",
    entryPoint: "/services",
    escalationCTA: "contact_form",
    estimatedSteps: 2,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "What's the procurement challenge closest to you right now — cost pressure, supplier risk, team capability, or visibility?",
      },
      {
        stepIndex: 1,
        type: "recommendation",
        recommendationId: "REC-EXP-01",
        content:
          "Profitia specializes in three areas: negotiation and cost intelligence, analytics and spend visibility, and procurement transformation.",
      },
    ],
  },

  UNKNOWN: {
    journeyId: "J-UNKNOWN-01",
    intent: "UNKNOWN",
    entryPoint: "/services",
    escalationCTA: "contact_form",
    estimatedSteps: 1,
    steps: [
      {
        stepIndex: 0,
        type: "question",
        content:
          "What's the procurement situation you're dealing with right now?",
      },
    ],
  },
};

// ── Route scoring ─────────────────────────────────────────

/**
 * Compute a 0–100 escalation score from session state.
 */
export function computeEscalationScore(state: SessionState): number {
  let score = 0;
  score += state.intentConfidence >= 0.8 ? 30 : state.intentConfidence >= 0.6 ? 15 : 0;
  score += state.urgency === "U1" ? 30 : state.urgency === "U2" ? 15 : 0;
  score += state.buyingStage === "S4" || state.buyingStage === "S5" ? 20 : state.buyingStage === "S3" ? 10 : 0;
  score += state.engagementScore >= 60 ? 15 : state.engagementScore >= 30 ? 7 : 0;
  score += state.ctaFatigue <= 1 ? 5 : 0; // CTA not yet exhausted
  return Math.min(100, score);
}

/**
 * Determine the next journey step for the current session.
 */
export function getNextRouteStep(
  session: AdvisorySession
): AdvisoryRouteStep | null {
  const journey = JOURNEY_REGISTRY[session.state.detectedIntent] ?? JOURNEY_REGISTRY["UNKNOWN"];
  const currentStep = session.state.journeyStep;
  return journey.steps[currentStep] ?? null;
}

/**
 * Get the full journey for a given intent.
 */
export function getJourneyForIntent(intent: IntentCode): AdvisoryRoute {
  return JOURNEY_REGISTRY[intent] ?? JOURNEY_REGISTRY["UNKNOWN"];
}

/**
 * Full routing decision computation.
 */
export function computeRoutingDecision(
  session: AdvisorySession,
  intentScore: IntentScore
): RoutingDecision {
  const journey = getJourneyForIntent(intentScore.primary);
  const escalationScore = computeEscalationScore(session.state);
  const nextStep = getNextRouteStep(session);
  const userMessageCount = session.messages.filter((m) => m.role === "user").length;

  const shouldEscalateNow =
    escalationScore >= 70 ||
    session.state.escalationReady ||
    (intentScore.urgency === "U1" && userMessageCount >= 2);

  const shouldShowRecommendation =
    intentScore.primaryConfidence >= 0.6 &&
    !shouldEscalateNow &&
    session.intelligence.recommendationsShown.length < 3 &&
    userMessageCount >= 1;

  const shouldAskQuestion =
    !shouldEscalateNow &&
    !shouldShowRecommendation &&
    (intentScore.primaryConfidence < 0.6 || userMessageCount === 0);

  const reason = shouldEscalateNow
    ? `escalation_score=${escalationScore}, urgency=${intentScore.urgency}`
    : shouldShowRecommendation
    ? `confidence=${intentScore.primaryConfidence.toFixed(2)}, intent=${intentScore.primary}`
    : `discovery — confidence=${intentScore.primaryConfidence.toFixed(2)}`;

  return {
    route: journey,
    confidence: Math.min(0.99, intentScore.primaryConfidence + 0.1),
    escalationScore,
    nextStep,
    shouldEscalateNow,
    shouldShowRecommendation,
    shouldAskQuestion,
    reason,
  };
}

/**
 * Return the recommended escalation CTA type for given intent + urgency.
 */
export function getEscalationCTAType(
  intent: IntentCode,
  urgency: string
): CTAType {
  if (urgency === "U1") return "contact_form";
  if (intent === "I6_EDUCATION") return "workshop";
  if (intent === "I1_SAVINGS") return "spot_analysis";
  return "contact_form";
}
