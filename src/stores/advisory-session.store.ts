// ─────────────────────────────────────────────────────────
// CI-Profitia — Advisory Session Store (ETAP 2)
// Zustand store — integrates Advisory Orchestrator
// ─────────────────────────────────────────────────────────

import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  AdvisoryDecision,
  AdvisorySession,
  BehavioralSignal,
  ConversationPhase,
  CTAItem,
  ETAP3Decision,
  IntentCode,
  Locale,
  Message,
  MessageMetadata,
  PageContext,
  ProactiveState,
  ProcurementMaturity,
  RecommendationCard,
  UrgencyLevel,
  BuyingStage,
} from "@/types";
import { getPageContext } from "@/lib/page-graph";
import { track } from "@/lib/analytics";
import { runAdvisoryOrchestrator } from "@/lib/engines/advisory-orchestrator";
import { computeNextPhase } from "@/lib/engines/advisory-state-machine";
import { runETAP3Orchestrator } from "@/lib/engines/etap3-orchestrator";
import { cicRuntimeClient } from "@/services/cic-runtime-client";
import type { OrchestrationResponse } from "@/runtime/schemas/orchestration.schema";

// ── State shape ───────────────────────────────────────────
interface AdvisorySessionStore {
  // Session
  session: AdvisorySession | null;
  isInitialized: boolean;

  // Widget UI state
  isOpen: boolean;
  isTyping: boolean;
  isStreaming: boolean;

  // ETAP 2: Orchestration state
  lastDecision: AdvisoryDecision | null;
  proactiveState: ProactiveState;

  // ETAP 3: Embedded advisory state
  lastETAP3Decision: ETAP3Decision | null;

  // ETAP 4: Remote runtime state
  lastOrchestrationResponse: OrchestrationResponse | null;
  isLoading: boolean;

  // Actions — Session
  initSession: (locale: Locale, slug: string) => void;
  updatePageContext: (slug: string) => void;
  runOrchestration: () => AdvisoryDecision | null;
  runRemoteOrchestration: () => Promise<OrchestrationResponse | null>;

  // Actions — Messages
  addMessage: (role: Message["role"], content: string, metadata?: MessageMetadata) => string;
  clearMessages: () => void;

  // Actions — Intelligence
  updateIntent: (intent: IntentCode, confidence: number) => void;
  updateUrgency: (urgency: UrgencyLevel) => void;
  updateBuyingStage: (stage: BuyingStage) => void;
  updateMaturity: (maturity: ProcurementMaturity) => void;
  setPhase: (phase: ConversationPhase) => void;
  incrementEngagement: (delta: number) => void;
  addBehavioralSignal: (signal: BehavioralSignal) => void;
  markRecommendationShown: (id: string) => void;
  markCTAShown: (id: string) => void;
  markCTAClicked: (id: string) => void;
  setEscalationReady: (ready: boolean) => void;
  updateScrollDepth: (slug: string, depth: number) => void;
  updateTimeOnPage: (slug: string, ms: number) => void;

  // Actions — Proactive
  triggerProactive: () => void;
  dismissProactive: () => void;
  convertProactive: () => void;

  // Actions — UI
  openAssistant: () => void;
  closeAssistant: () => void;
  setTyping: (typing: boolean) => void;
  setStreaming: (streaming: boolean) => void;
}

// ── Initial session state ─────────────────────────────────
function createSession(locale: Locale, slug: string): AdvisorySession {
  const pageContext = getPageContext(slug);
  return {
    id: nanoid(),
    locale,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    pageContext,
    messages: [],
    state: {
      phase: "idle",
      detectedIntent: "UNKNOWN",
      intentConfidence: 0,
      urgency: "U3",
      buyingStage: "S1",
      maturity: "unknown",
      journeyId: null,
      journeyStep: 0,
      escalationReady: false,
      ctaFatigue: 0,
      engagementScore: 0,
    },
    intelligence: {
      pagesVisited: [slug as PageContext["slug"]],
      scrollDepth: {},
      timeOnPage: {},
      behavioralSignals: [],
      recommendationsShown: [],
      ctasShown: [],
      ctaClicked: null,
    },
  };
}

const INITIAL_PROACTIVE: ProactiveState = {
  triggered: false,
  trigger: null,
  shownAt: null,
  dismissed: false,
  converted: false,
};

// ── Store ──────────────────────────────────────────────────
export const useAdvisorySession = create<AdvisorySessionStore>((set, get) => ({
  session: null,
  isInitialized: false,
  isOpen: false,
  isTyping: false,
  isStreaming: false,
  lastDecision: null,
  proactiveState: INITIAL_PROACTIVE,
  lastETAP3Decision: null,
  lastOrchestrationResponse: null,
  isLoading: false,

  initSession: (locale, slug) => {
    const session = createSession(locale, slug);
    set({ session, isInitialized: true });
    // Run initial orchestration
    setTimeout(() => get().runOrchestration(), 200);
  },

  updatePageContext: (slug) => {
    const { session } = get();
    if (!session) return;
    const pageContext = getPageContext(slug);
    const pagesVisited = session.intelligence.pagesVisited.includes(slug as PageContext["slug"])
      ? session.intelligence.pagesVisited
      : [...session.intelligence.pagesVisited, slug as PageContext["slug"]];

    set({
      session: {
        ...session,
        pageContext,
        lastActivityAt: Date.now(),
        intelligence: { ...session.intelligence, pagesVisited },
      },
    });

    track.pageContextChange(session.pageContext.slug, slug);
    get().runOrchestration();
  },

  runOrchestration: () => {
    const { session } = get();
    if (!session) return null;

    const decision = runAdvisoryOrchestrator(session);

    // Apply orchestrator output back to session state
    const nextPhase = computeNextPhase(session);

    set((state) => {
      if (!state.session) return {};
      const updatedSession: AdvisorySession = {
        ...state.session,
        state: {
          ...state.session.state,
          detectedIntent: decision.intent.primary,
          intentConfidence: decision.intent.primaryConfidence,
          urgency: decision.intent.urgency,
          maturity: decision.maturity.level,
          phase: nextPhase,
          escalationReady: decision.routing.shouldEscalateNow,
          journeyId: decision.routing.route?.journeyId ?? null,
          journeyStep: decision.routing.nextStep?.stepIndex ?? state.session.state.journeyStep,
        },
      };
      return { session: updatedSession, lastDecision: decision };
    });

    // Run ETAP 3 orchestration on top of base decision
    const freshSession = get().session;
    if (freshSession) {
      const etap3Decision = runETAP3Orchestrator(freshSession, decision);
      set({ lastETAP3Decision: etap3Decision });
    }

    // Track maturity detection if significant change
    if (decision.maturity.confidence >= 0.6) {
      track.maturityDetected(decision.maturity.persona, decision.maturity.score);
    }

    // Track routing decision
    track.routingDecision(
      decision.routing.reason,
      decision.routing.escalationScore
    );

    return decision;
  },

  addMessage: (role, content, metadata) => {
    const { session } = get();
    if (!session) return "";
    const id = nanoid();
    const message: Message = {
      id,
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };
    set({
      session: {
        ...session,
        lastActivityAt: Date.now(),
        messages: [...session.messages, message],
        state: {
          ...session.state,
          phase: session.state.phase === "idle" ? "opening" : session.state.phase,
          engagementScore: Math.min(100, session.state.engagementScore + (role === "user" ? 8 : 3)),
        },
      },
    });

    // Re-run orchestration after each user message
    if (role === "user") {
      setTimeout(() => get().runOrchestration(), 50);
    }

    return id;
  },

  clearMessages: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, messages: [] } });
  },

  updateIntent: (intent, confidence) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        state: { ...session.state, detectedIntent: intent, intentConfidence: confidence },
      },
    });
    track.intentDetected(intent, confidence);
  },

  updateUrgency: (urgency) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, state: { ...session.state, urgency } } });
  },

  updateBuyingStage: (stage) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, state: { ...session.state, buyingStage: stage } } });
  },

  updateMaturity: (maturity) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, state: { ...session.state, maturity } } });
  },

  setPhase: (phase) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, state: { ...session.state, phase } } });
  },

  incrementEngagement: (delta) => {
    const { session } = get();
    if (!session) return;
    const newScore = Math.min(100, session.state.engagementScore + delta);
    set({
      session: {
        ...session,
        state: { ...session.state, engagementScore: newScore },
      },
    });
    track.engagementScore(newScore);
  },

  addBehavioralSignal: (signal) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        intelligence: {
          ...session.intelligence,
          behavioralSignals: [...session.intelligence.behavioralSignals, signal],
        },
      },
    });
    track.behavioralSignal(signal.type, signal.pageSlug);
    // Re-run orchestration on significant behavioral signals
    if (signal.type === "deep_scroll" || signal.type === "repeated_visit") {
      setTimeout(() => get().runOrchestration(), 100);
    }
  },

  markRecommendationShown: (id) => {
    const { session } = get();
    if (!session) return;
    if (session.intelligence.recommendationsShown.includes(id)) return;
    set({
      session: {
        ...session,
        intelligence: {
          ...session.intelligence,
          recommendationsShown: [...session.intelligence.recommendationsShown, id],
        },
      },
    });
  },

  markCTAShown: (id) => {
    const { session } = get();
    if (!session) return;
    const ctaFatigue = session.state.ctaFatigue + 1;
    set({
      session: {
        ...session,
        state: { ...session.state, ctaFatigue },
        intelligence: {
          ...session.intelligence,
          ctasShown: [...session.intelligence.ctasShown, id],
        },
      },
    });
  },

  markCTAClicked: (id) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        intelligence: { ...session.intelligence, ctaClicked: id },
      },
    });
  },

  setEscalationReady: (ready) => {
    const { session } = get();
    if (!session) return;
    set({
      session: { ...session, state: { ...session.state, escalationReady: ready } },
    });
  },

  updateScrollDepth: (slug, depth) => {
    const { session } = get();
    if (!session) return;
    const current = session.intelligence.scrollDepth[slug] ?? 0;
    if (depth <= current) return; // only update if deeper
    set({
      session: {
        ...session,
        intelligence: {
          ...session.intelligence,
          scrollDepth: { ...session.intelligence.scrollDepth, [slug]: depth },
        },
      },
    });
    if (depth >= 75) {
      get().runOrchestration();
    }
  },

  updateTimeOnPage: (slug, ms) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        intelligence: {
          ...session.intelligence,
          timeOnPage: { ...session.intelligence.timeOnPage, [slug]: ms },
        },
      },
    });
  },

  // Proactive
  triggerProactive: () => {
    const { session, lastDecision } = get();
    if (!session || !lastDecision?.proactive) return;
    set({
      proactiveState: {
        triggered: true,
        trigger: lastDecision.proactive,
        shownAt: Date.now(),
        dismissed: false,
        converted: false,
      },
    });
    track.proactiveTriggered(lastDecision.proactive.type, lastDecision.proactive.score);
  },

  dismissProactive: () => {
    set((state) => ({
      proactiveState: { ...state.proactiveState, dismissed: true },
    }));
    track.proactiveDismissed();
  },

  convertProactive: () => {
    set((state) => ({
      proactiveState: { ...state.proactiveState, converted: true },
    }));
    track.proactiveConverted();
  },

  openAssistant: () => {
    set({ isOpen: true });
    track.assistantOpened();
  },

  closeAssistant: () => {
    set({ isOpen: false });
    track.assistantClosed();
  },

  setTyping: (typing) => set({ isTyping: typing }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  runRemoteOrchestration: async () => {
    const { session } = get();
    if (!session) return null;
    set({ isLoading: true });
    try {
      const s = session;
      const pageSlug = s.pageContext.slug;
      const request = {
        sessionId: s.id,
        locale: s.locale,
        deploymentId: "ci-profitia-website",
        pageSlug,
        messages: s.messages.map((m) => ({ role: m.role, content: m.content })),
        sessionState: {
          phase: s.state.phase,
          detectedIntent: s.state.detectedIntent,
          intentConfidence: s.state.intentConfidence,
          urgency: s.state.urgency,
          buyingStage: s.state.buyingStage,
          maturity: s.state.maturity,
          journeyId: s.state.journeyId ?? null,
          journeyStep: s.state.journeyStep,
          escalationReady: s.state.escalationReady,
          ctaFatigue: s.state.ctaFatigue,
          engagementScore: s.state.engagementScore,
        },
        intelligence: {
          pagesVisited: s.intelligence.pagesVisited as string[],
          scrollDepth: s.intelligence.scrollDepth as Record<string, number>,
          timeOnPage: s.intelligence.timeOnPage as Record<string, number>,
          behavioralSignals: s.intelligence.behavioralSignals.map((sig) => ({
            type: sig.type,
            pageSlug: sig.pageSlug as string,
            timestamp: sig.timestamp,
            metadata: sig.metadata,
          })),
          recommendationsShown: s.intelligence.recommendationsShown,
          ctasShown: s.intelligence.ctasShown,
          ctaClicked: s.intelligence.ctaClicked ?? null,
        },
      };
      const response = await cicRuntimeClient.orchestrate(request);
      set({ lastOrchestrationResponse: response });
      return response;
    } catch (err) {
      console.error("[advisory-store] Remote orchestration failed:", err);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ── Backward-compat alias ─────────────────────────────────
export const useAdvisoryStore = useAdvisorySession;


