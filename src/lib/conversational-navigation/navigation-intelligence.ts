// ─────────────────────────────────────────────────────────
// CI-Profitia — Conversational Navigation Intelligence
// Computes next-step navigation hints based on session context.
// Guides users through the capability ecosystem.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryDecision,
  AdvisorySession,
  NavigationDecision,
  NavigationHint,
  PageSlug,
} from "@/types";
import { CAPABILITY_NODES } from "../capability-discovery/capability-graph";

// ── Navigation hint registry ──────────────────────────────
// Context-aware messages that guide users to next-best pages.
const NAVIGATION_HINTS: NavigationHint[] = [
  // Supplier risk → Supplier Intelligence
  {
    id: "NAV-SR-01",
    message: {
      pl: "Widzę, że analizujesz ryzyko dostawcy. Chcesz zobaczyć jak wygląda scoring finansowy dostawców?",
      en: "I can see you're exploring supplier risk. Would you like to see how supplier financial scoring works?",
    },
    targetSlug: "/services/supplier-intelligence",
    targetLabel: {
      pl: "Supplier Intelligence →",
      en: "Supplier Intelligence →",
    },
    confidence: 0.85,
    intent: "I3_SUPPLIER_RISK",
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
  },

  // Savings intent → SPOT Analysis
  {
    id: "NAV-SAV-01",
    message: {
      pl: "Szukasz oszczędności zakupowych? SPOT Analysis w 5–10 dni wskazuje konkretne kategorie i potencjał.",
      en: "Looking for procurement savings? SPOT Analysis identifies specific categories and potential in 5–10 days.",
    },
    targetSlug: "/services/analiza-spot",
    targetLabel: {
      pl: "SPOT Analysis →",
      en: "SPOT Analysis →",
    },
    confidence: 0.9,
    intent: "I1_SAVINGS",
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
  },

  // Negotiations → Should-Cost
  {
    id: "NAV-NEG-01",
    message: {
      pl: "Przygotowujesz się do negocjacji? Should-cost analysis daje Ci pozycję kosztową zanim wejdziesz do sali.",
      en: "Preparing for negotiations? Should-cost analysis gives you the cost position before entering the room.",
    },
    targetSlug: "/services/should-cost-analysis",
    targetLabel: {
      pl: "Should-Cost Analysis →",
      en: "Should-Cost Analysis →",
    },
    confidence: 0.9,
    intent: "I8_NEGOTIATIONS",
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
  },

  // Negotiations → Negotiation Preparation
  {
    id: "NAV-NEG-02",
    message: {
      pl: "Wymagające negocjacje wymagają kompletnego playbooku. Widzisz jak wygląda nasze przygotowanie negocjacyjne?",
      en: "Demanding negotiations require a complete playbook. Would you like to see our negotiation preparation process?",
    },
    targetSlug: "/services/negotiation-preparation",
    targetLabel: {
      pl: "Negotiation Preparation →",
      en: "Negotiation Preparation →",
    },
    confidence: 0.85,
    intent: "I8_NEGOTIATIONS",
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
  },

  // Forecasting → Spend Cube
  {
    id: "NAV-FC-01",
    message: {
      pl: "Chcesz przewidywalność kosztów? Spend Cube to wielowymiarowy widok Twojego spend.",
      en: "Want cost predictability? Spend Cube is the multidimensional view of your spend.",
    },
    targetSlug: "/services/spend-cube",
    targetLabel: {
      pl: "Spend Cube →",
      en: "Spend Cube →",
    },
    confidence: 0.8,
    intent: "I2_FORECASTING",
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
  },

  // Sourcing → Category Strategy
  {
    id: "NAV-SRC-01",
    message: {
      pl: "Strategiczne zarządzanie zakupami zaczyna się od category strategy. Chcesz zobaczyć jak to wygląda?",
      en: "Strategic procurement management starts with category strategy. Would you like to see how it works?",
    },
    targetSlug: "/services/category-strategy",
    targetLabel: {
      pl: "Category Strategy →",
      en: "Category Strategy →",
    },
    confidence: 0.8,
    intent: "I5_SOURCING",
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
  },

  // Digitalization → Transformation
  {
    id: "NAV-DIG-01",
    message: {
      pl: "Digitalizacja zakupów wymaga solidnej podstawy procesowej. Zobaczysz nasze podejście do transformacji?",
      en: "Procurement digitalisation requires a solid process foundation. Would you like to see our transformation approach?",
    },
    targetSlug: "/services/procurement-transformation",
    targetLabel: {
      pl: "Procurement Transformation →",
      en: "Procurement Transformation →",
    },
    confidence: 0.78,
    intent: "I4_DIGITALIZATION",
    maturityPersonas: ["advanced_analyst", "transformation_leader"],
  },

  // Education → Workshops
  {
    id: "NAV-EDU-01",
    message: {
      pl: "Szukasz programu edukacyjnego dla zespołu? Mamy warsztaty skrojone pod konkretne organizacje.",
      en: "Looking for a team education programme? We have workshops tailored to specific organisations.",
    },
    targetSlug: "/education/in-company-workshops",
    targetLabel: {
      pl: "In-Company Workshops →",
      en: "In-Company Workshops →",
    },
    confidence: 0.8,
    intent: "I6_EDUCATION",
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
  },

  // Executive → Contact
  {
    id: "NAV-EX-01",
    message: {
      pl: "To wygląda na temat wymagający rozmowy strategicznej. Umów się bezpośrednio z doradcą.",
      en: "This looks like a topic requiring a strategic conversation. Connect directly with an advisor.",
    },
    targetSlug: "/contact",
    targetLabel: {
      pl: "Porozmawiajmy →",
      en: "Let's talk →",
    },
    confidence: 0.9,
    intent: "I1_SAVINGS",
    maturityPersonas: ["executive_stakeholder", "transformation_leader"],
  },

  // Supplier risk / benchmarking
  {
    id: "NAV-BENCH-01",
    message: {
      pl: "Masz benchmarki cenowe dla kluczowych kategorii? Supplier Benchmarking daje rynkowe punkty odniesienia.",
      en: "Do you have price benchmarks for key categories? Supplier Benchmarking provides market reference points.",
    },
    targetSlug: "/services/supplier-benchmarking",
    targetLabel: {
      pl: "Supplier Benchmarking →",
      en: "Supplier Benchmarking →",
    },
    confidence: 0.75,
    intent: "I3_SUPPLIER_RISK",
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
  },
];

// ── Compute navigation decision ───────────────────────────
export function computeNavigationDecision(
  session: AdvisorySession,
  decision: AdvisoryDecision
): NavigationDecision {
  const visitedSlugs = new Set<PageSlug>(session.intelligence.pagesVisited);
  const currentSlug = session.pageContext.slug;
  const primaryIntent = decision.intent.primary;
  const persona = decision.maturity.persona;

  // Score hints
  const scored = NAVIGATION_HINTS
    .filter((hint) => {
      // Don't hint to current or already-visited page
      if (hint.targetSlug === currentSlug) return false;
      if (visitedSlugs.has(hint.targetSlug)) return false;
      return true;
    })
    .map((hint) => {
      let score = 0;

      // Intent match
      if (hint.intent === primaryIntent) {
        score += 40 * decision.intent.primaryConfidence;
      } else if (hint.intent === decision.intent.secondary) {
        score += 20 * decision.intent.secondaryConfidence;
      }

      // Maturity match
      if (hint.maturityPersonas.includes(persona)) {
        score += 30;
      } else if (persona === "unknown") {
        score += 10;
      }

      // Confidence weighting
      score *= hint.confidence;

      // Executive routing: executives → contact first
      if (persona === "executive_stakeholder" && hint.targetSlug === "/contact") {
        score += 20;
      }

      return { hint, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { hint: null, alternativePaths: [], rationale: "no_matching_hints" };
  }

  const primary = scored[0].hint;
  const alternatives = scored.slice(1, 3).map((s) => s.hint);

  // Only show hint if intent confidence is reasonable
  const shouldShow = decision.intent.primaryConfidence > 0.3;

  return {
    hint: shouldShow ? primary : null,
    alternativePaths: shouldShow ? alternatives : [],
    rationale: `${primary.id}:intent=${primaryIntent} persona=${persona} conf=${Math.round(decision.intent.primaryConfidence * 100)}%`,
  };
}
