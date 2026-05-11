// ─────────────────────────────────────────────────────────
// CIC Runtime — Session Runtime
// Server-side session intelligence. Processes session events
// and returns insights that drive proactive triggers and
// re-orchestration decisions.
// ─────────────────────────────────────────────────────────

import type {
  SessionRuntimeRequest,
  SessionRuntimeResponse,
} from "../schemas/session.schema";

// ── Engagement trend analysis ─────────────────────────────
function detectEngagementTrend(
  event: SessionRuntimeRequest["event"],
  currentState: SessionRuntimeRequest["currentState"]
): "increasing" | "stable" | "declining" {
  if (event.type === "engagement" && event.delta > 0) return "increasing";
  if (event.type === "scroll_depth" && event.depth > 60) return "increasing";
  if (event.type === "message_sent" && event.role === "user") return "increasing";
  if (currentState.engagementScore < 20) return "declining";
  return "stable";
}

// ── Advisory readiness score ──────────────────────────────
function computeAdvisoryReadiness(
  state: SessionRuntimeRequest["currentState"]
): number {
  let score = 0;

  // Engagement score (0-40)
  score += Math.min(40, state.engagementScore * 0.4);

  // Intent confidence (0-30)
  score += state.intentConfidence * 30;

  // Pages visited (0-15)
  score += Math.min(15, state.pagesVisited.length * 5);

  // Messages (0-15)
  score += Math.min(15, state.messagesCount * 3);

  // Urgency adjustment
  if (state.urgency === "U1") score = Math.min(100, score + 20);
  else if (state.urgency === "U2") score = Math.min(100, score + 10);

  return Math.round(score);
}

// ── Session health ────────────────────────────────────────
function computeSessionHealth(
  state: SessionRuntimeRequest["currentState"],
  advisoryReadiness: number
): SessionRuntimeResponse["insights"]["sessionHealth"] {
  if (advisoryReadiness >= 80 || state.urgency === "U1") return "high_value";
  if (state.engagementScore < 15 && state.messagesCount === 0) return "stale";
  if (state.ctaFatigue >= 4) return "at_risk";
  return "healthy";
}

// ── Session depth ─────────────────────────────────────────
function computeSessionDepth(
  state: SessionRuntimeRequest["currentState"]
): SessionRuntimeResponse["insights"]["sessionDepth"] {
  if (state.messagesCount >= 6 || state.engagementScore >= 70) return "committed";
  if (state.messagesCount >= 3 || state.engagementScore >= 40) return "deep";
  if (state.messagesCount >= 1 || state.pagesVisited.length >= 2) return "engaged";
  return "surface";
}

// ── Proactive trigger evaluation ──────────────────────────
function evaluateProactive(
  event: SessionRuntimeRequest["event"],
  state: SessionRuntimeRequest["currentState"],
  advisoryReadiness: number
): {
  trigger: boolean;
  type: string | null;
  message: Record<string, string> | null;
} {
  // Deep scroll on intent page → trigger
  if (
    event.type === "scroll_depth" &&
    event.depth >= 75 &&
    state.intentConfidence >= 0.5
  ) {
    return {
      trigger: true,
      type: "deep_scroll_high_intent",
      message: {
        pl: "Widzę, że przeglądasz ten temat dokładnie. Chętnie odpowiem na pytania lub omówię Waszą sytuację.",
        en: "I see you're reviewing this topic carefully. Happy to answer questions or discuss your situation.",
      },
    };
  }

  // Time dwell on service page → trigger
  if (
    event.type === "time_on_page" &&
    event.ms >= 45000 &&
    state.pagesVisited.some((p) => p.startsWith("/services"))
  ) {
    return {
      trigger: true,
      type: "pricing_page_dwell",
      message: {
        pl: "Czy mogę pomóc odpowiedzieć na pytania o tę usługę?",
        en: "Can I help answer any questions about this service?",
      },
    };
  }

  // High advisory readiness → trigger
  if (advisoryReadiness >= 75 && state.messagesCount === 0) {
    return {
      trigger: true,
      type: "escalation_ready",
      message: {
        pl: "Na podstawie Twojej aktywności — myślę, że warto porozmawiać. Umów 20 minut?",
        en: "Based on your activity — I think it's worth a conversation. Book 20 minutes?",
      },
    };
  }

  // Multiple pages visited → comparison behavior
  if (
    event.type === "page_view" &&
    state.pagesVisited.length >= 3 &&
    state.pagesVisited.filter((p) => p.startsWith("/services")).length >= 2
  ) {
    return {
      trigger: true,
      type: "comparison_behavior",
      message: {
        pl: "Porównujesz kilka naszych obszarów? Mogę pomóc znaleźć najlepsze dopasowanie do Waszej sytuacji.",
        en: "Comparing a few of our areas? I can help find the best fit for your situation.",
      },
    };
  }

  return { trigger: false, type: null, message: null };
}

// ── Re-orchestration trigger ──────────────────────────────
function shouldReOrchestrate(
  event: SessionRuntimeRequest["event"],
  state: SessionRuntimeRequest["currentState"]
): { reRun: boolean; reason: string | null } {
  if (event.type === "scroll_depth" && event.depth >= 75) {
    return { reRun: true, reason: "deep_scroll" };
  }
  if (event.type === "page_view") {
    return { reRun: true, reason: "page_navigation" };
  }
  if (event.type === "message_sent" && event.role === "user") {
    return { reRun: true, reason: "user_message" };
  }
  if (event.type === "cta_clicked") {
    return { reRun: true, reason: "cta_interaction" };
  }
  return { reRun: false, reason: null };
}

// ── Engagement delta by event type ────────────────────────
function computeEngagementDelta(
  event: SessionRuntimeRequest["event"]
): number {
  switch (event.type) {
    case "message_sent":
      return event.role === "user" ? 8 : 3;
    case "scroll_depth":
      return event.depth >= 75 ? 10 : event.depth >= 50 ? 5 : 2;
    case "time_on_page":
      return event.ms >= 60000 ? 8 : event.ms >= 30000 ? 4 : 0;
    case "cta_clicked":
      return 15;
    case "cta_shown":
      return 2;
    case "recommendation_shown":
      return 3;
    case "behavioral_signal":
      return 4;
    default:
      return 0;
  }
}

// ── Main session runtime function ─────────────────────────
export function runSessionRuntime(
  request: SessionRuntimeRequest
): SessionRuntimeResponse {
  const { sessionId, event, currentState } = request;

  const engagementTrend = detectEngagementTrend(event, currentState);
  const advisoryReadiness = computeAdvisoryReadiness(currentState);
  const sessionHealth = computeSessionHealth(currentState, advisoryReadiness);
  const sessionDepth = computeSessionDepth(currentState);

  const proactive = evaluateProactive(event, currentState, advisoryReadiness);
  const reOrchestration = shouldReOrchestrate(event, currentState);
  const engagementDelta = computeEngagementDelta(event);

  // Next best action
  let nextBestAction: SessionRuntimeResponse["insights"]["nextBestAction"] = null;
  if (proactive.trigger) nextBestAction = "trigger_proactive";
  else if (reOrchestration.reRun) nextBestAction = "re_orchestrate";
  else if (sessionHealth === "high_value") nextBestAction = "show_recommendation";
  else if (currentState.urgency === "U1") nextBestAction = "escalate";

  return {
    sessionId,

    insights: {
      engagementTrend,
      advisoryReadiness,
      sessionHealth,
      sessionDepth,
      triggerProactive: proactive.trigger,
      proactiveType: proactive.type,
      proactiveMessage: proactive.message,
      reRunOrchestration: reOrchestration.reRun,
      orchestrationTrigger: reOrchestration.reason,
      nextBestAction,
    },

    memoryUpdate: {
      shouldPersist: sessionDepth === "committed" || advisoryReadiness >= 60,
      signals: [engagementTrend, sessionHealth, sessionDepth].filter(Boolean),
      engagementDelta,
    },

    timestamp: Date.now(),
  };
}
