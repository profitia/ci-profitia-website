// ─────────────────────────────────────────────────────────
// Proactive Engagement Engine v1
// Evaluates behavioral triggers and generates proactive prompts
// ─────────────────────────────────────────────────────────

import type {
  AdvisorySession,
  CTAType,
  Locale,
  PageContext,
  PageSlug,
  ProactiveTrigger,
  ProactiveTriggerType,
} from "@/types";

// ── Trigger definitions ───────────────────────────────────

const HIGH_INTENT_PAGES: PageSlug[] = [
  "/services/analiza-spot",
  "/services/negotiation-preparation",
  "/services/supplier-negotiation-support",
  "/services/should-cost-analysis",
  "/services/procurement-transformation",
  "/contact",
];

const EDUCATION_INTENT_PAGES: PageSlug[] = [
  "/education/warsztaty-negocjacyjne",
  "/education/advanced-negotiations",
  "/education/fact-based-negotiation",
  "/education/spend-analytics-training",
];

// ── Trigger message library ───────────────────────────────
function buildTriggerMessages(
  type: ProactiveTriggerType,
  pageContext: PageContext
): Record<Locale, string> {
  const pageTitle = pageContext.slug;

  const messages: Record<ProactiveTriggerType, Record<Locale, string>> = {
    deep_scroll_high_intent: {
      pl: `Widzę, że dokładnie przeglądasz tę stronę. Jeśli masz konkretne pytanie o tym podejściu - chętnie odpowiem.`,
      en: `Looks like you're exploring this carefully. If you have a specific question about this approach, I'm here.`,
    },
    repeated_visit: {
      pl: `To już Twoja kolejna wizyta na tej stronie. Czy jest coś, co chciałbyś dokładniej omówić?`,
      en: `This is your second visit here. Is there something specific you'd like to explore further?`,
    },
    idle_after_recommendation: {
      pl: `Czy któraś z rekomendacji była trafna dla Twojej sytuacji? Możemy zagłębić się w szczegóły.`,
      en: `Did any of the recommendations resonate with your situation? Happy to go deeper on any of them.`,
    },
    pricing_page_dwell: {
      pl: `Przeglądasz tę usługę przez chwilę. Chętnie wyjaśnię, czego możesz oczekiwać i jak wygląda zakres.`,
      en: `You've been on this service page a while. Happy to explain what to expect and how we'd scope it.`,
    },
    comparison_behavior: {
      pl: `Wygląda na to, że porównujesz różne podejścia. Jeśli opisałbyś sytuację, mogę wskazać, które najlepiej pasuje.`,
      en: `Looks like you're comparing approaches. Describe your situation and I can point you to what fits best.`,
    },
    workshop_readiness: {
      pl: `Jeśli rozważasz program szkoleniowy dla zespołu, możemy omówić zakres i dopasowanie do Waszych priorytetów.`,
      en: `If you're considering a training programme for your team, I can help scope what would fit best.`,
    },
    escalation_ready: {
      pl: `Na podstawie tego, co czytasz, mam wrażenie, że masz konkretny challenge. Chętnie pomogę go sprecyzować.`,
      en: `Based on what you're reading, it sounds like you have a specific challenge in mind. I can help you frame it.`,
    },
    hesitation_recovery: {
      pl: `Nie musisz decydować teraz. Jeśli masz pytanie, które blokuje Cię przed kolejnym krokiem - chętnie odpowiem.`,
      en: `No pressure to decide now. If there's a question holding you back from the next step, I'm happy to help.`,
    },
  };

  return messages[type];
}

// ── Trigger evaluation ────────────────────────────────────

interface TriggerCandidate {
  type: ProactiveTriggerType;
  score: number;
  ctaType: CTAType;
  delay: number;
  priority: number;
}

/**
 * Evaluate all proactive triggers and return the highest-priority one.
 */
export function evaluateProactiveTriggers(
  session: AdvisorySession
): ProactiveTrigger | null {
  if (!session || session.messages.filter((m) => m.role === "user").length > 0) {
    // Don't trigger proactive if user has already engaged
    // Proactive is for pre-conversation or post-recommendation idleness
    const isIdleAfterRec =
      session.intelligence.recommendationsShown.length > 0 &&
      session.messages.filter((m) => m.role === "user").length >=
        session.intelligence.recommendationsShown.length * 2;
    if (!isIdleAfterRec && session.messages.filter((m) => m.role === "user").length > 0) {
      return null;
    }
  }

  const candidates: TriggerCandidate[] = [];
  const { intelligence, state, pageContext } = session;
  const userMessageCount = session.messages.filter((m) => m.role === "user").length;
  const isHighIntentPage = HIGH_INTENT_PAGES.includes(pageContext.slug);
  const isEducationPage = EDUCATION_INTENT_PAGES.includes(pageContext.slug);

  // --- Repeated visit ---
  if (intelligence.pagesVisited.filter((p) => p === pageContext.slug).length >= 2) {
    candidates.push({
      type: "repeated_visit",
      score: 75,
      ctaType: "contact_form",
      delay: 3000,
      priority: 1,
    });
  }

  // --- Deep scroll on high-intent page ---
  const scrollDepth = intelligence.scrollDepth[pageContext.slug] ?? 0;
  if (scrollDepth >= 75 && isHighIntentPage && userMessageCount === 0) {
    candidates.push({
      type: "deep_scroll_high_intent",
      score: 80,
      ctaType: "contact_form",
      delay: 2000,
      priority: 2,
    });
  }

  // --- Pricing/service page dwell ---
  const timeOnPage = intelligence.timeOnPage[pageContext.slug] ?? 0;
  if (timeOnPage >= 30000 && (isHighIntentPage || isEducationPage) && userMessageCount === 0) {
    candidates.push({
      type: "pricing_page_dwell",
      score: 70,
      ctaType: isEducationPage ? "workshop" : "contact_form",
      delay: 5000,
      priority: 3,
    });
  }

  // --- Comparison behavior: visited 2+ service pages ---
  const servicePageCount = intelligence.pagesVisited.filter((p) =>
    typeof p === "string" && p.startsWith("/services/")
  ).length;
  if (servicePageCount >= 3 && userMessageCount === 0) {
    candidates.push({
      type: "comparison_behavior",
      score: 65,
      ctaType: "contact_form",
      delay: 4000,
      priority: 4,
    });
  }

  // --- Workshop readiness ---
  if (
    isEducationPage &&
    (scrollDepth >= 60 || timeOnPage >= 20000) &&
    userMessageCount === 0
  ) {
    candidates.push({
      type: "workshop_readiness",
      score: 60,
      ctaType: "workshop",
      delay: 6000,
      priority: 5,
    });
  }

  // --- Idle after recommendation ---
  const hasShownRec = intelligence.recommendationsShown.length > 0;
  const lastBehavioral = intelligence.behavioralSignals[intelligence.behavioralSignals.length - 1];
  if (
    hasShownRec &&
    lastBehavioral?.type === "inactivity" &&
    intelligence.ctaClicked === null
  ) {
    candidates.push({
      type: "idle_after_recommendation",
      score: 72,
      ctaType: "contact_form",
      delay: 8000,
      priority: 6,
    });
  }

  // --- Hesitation recovery ---
  const hesitationCount = intelligence.behavioralSignals.filter(
    (s) => s.type === "hesitation" || s.type === "cta_avoidance" || s.type === "pricing_hesitation"
  ).length;
  if (hesitationCount >= 2 && scrollDepth >= 50) {
    candidates.push({
      type: "hesitation_recovery",
      score: 55,
      ctaType: "email",
      delay: 5000,
      priority: 7,
    });
  }

  // --- Escalation ready: high confidence + high engagement ---
  if (state.intentConfidence >= 0.75 && state.engagementScore >= 60 && userMessageCount === 0) {
    candidates.push({
      type: "escalation_ready",
      score: 85,
      ctaType: "contact_form",
      delay: 2000,
      priority: 1,
    });
  }

  if (candidates.length === 0) return null;

  // Pick highest priority (lowest number) with highest score
  const best = candidates.sort((a, b) => a.priority - b.priority || b.score - a.score)[0];

  return {
    type: best.type,
    score: best.score,
    pageSlug: pageContext.slug,
    message: buildTriggerMessages(best.type, pageContext),
    ctaType: best.ctaType,
    delay: best.delay,
    priority: best.priority,
  };
}

/**
 * Get the proactive message text for the current locale.
 */
export function getProactiveMessage(
  trigger: ProactiveTrigger,
  locale: Locale
): string {
  return trigger.message[locale] ?? trigger.message["en"];
}

/**
 * Score the overall proactive readiness (0–100).
 * Used to decide whether to render proactive UI at all.
 */
export function computeProactiveScore(session: AdvisorySession): number {
  const { intelligence, state } = session;
  const userCount = session.messages.filter((m) => m.role === "user").length;

  if (userCount > 0 && intelligence.recommendationsShown.length === 0) return 0;

  let score = 0;
  const scrollDepth = intelligence.scrollDepth[session.pageContext.slug] ?? 0;
  const timeOnPage = intelligence.timeOnPage[session.pageContext.slug] ?? 0;

  score += Math.min(30, scrollDepth * 0.4);
  score += Math.min(20, (timeOnPage / 1000) * 0.5);
  score += intelligence.pagesVisited.length >= 2 ? 20 : 0;
  score += state.intentConfidence >= 0.6 ? 20 : state.intentConfidence >= 0.4 ? 10 : 0;
  score += intelligence.behavioralSignals.length >= 2 ? 10 : 0;

  return Math.min(100, Math.round(score));
}
