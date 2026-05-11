// ─────────────────────────────────────────────────────────
// CI-Profitia — Executive Profile Registry
// Maps maturity persona to executive messaging angles,
// KPIs, and advisory tone.
// ─────────────────────tml────────────────────────────────────

import type { ExecutiveProfile, ExecutiveRole, Locale, MaturityPersona } from "@/types";

// ── Executive profiles ────────────────────────────────────
export const EXECUTIVE_PROFILES: Record<ExecutiveRole, ExecutiveProfile> = {
  CFO: {
    role: "CFO",
    kpis: ["EBIT impact", "Working capital", "Cost predictability", "Procurement ROI", "Risk-adjusted spend"],
    messagingAngle: "Procurement as a direct EBIT lever — cost reduction with verifiable ROI",
    tone: "executive",
    priorityIntents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK"],
  },
  CEO: {
    role: "CEO",
    kpis: ["Competitive advantage", "Revenue enablement", "Strategic risk", "Growth capacity", "Market position"],
    messagingAngle: "Procurement as strategic capability — competitive differentiation and risk management",
    tone: "executive",
    priorityIntents: ["I5_SOURCING", "I1_SAVINGS", "I3_SUPPLIER_RISK"],
  },
  CPO: {
    role: "CPO",
    kpis: ["Procurement maturity", "Category excellence", "Team capability", "Savings delivery", "Supplier intelligence"],
    messagingAngle: "Building procurement into a strategic function — maturity, analytics and supplier development",
    tone: "peer",
    priorityIntents: ["I5_SOURCING", "I2_FORECASTING", "I6_EDUCATION"],
  },
  procurement_director: {
    role: "procurement_director",
    kpis: ["Negotiation effectiveness", "Supplier performance", "Category savings", "Process efficiency", "Risk exposure"],
    messagingAngle: "Operational excellence through category strategy, fact-based negotiation and supplier intelligence",
    tone: "strategic",
    priorityIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I3_SUPPLIER_RISK", "I5_SOURCING"],
  },
  category_manager: {
    role: "category_manager",
    kpis: ["Category savings", "Supplier development", "Negotiation leverage", "Cost intelligence", "Benchmarks"],
    messagingAngle: "Category mastery through should-cost, benchmarking and structured negotiation",
    tone: "analytical",
    priorityIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I5_SOURCING"],
  },
  general: {
    role: "general",
    kpis: ["Cost savings", "Supplier quality", "Process efficiency", "Risk management", "Business impact"],
    messagingAngle: "Procurement advisory to solve the most critical procurement challenges",
    tone: "diagnostic",
    priorityIntents: ["I1_SAVINGS", "I7_EXPLORATORY"],
  },
};

// ── Detect executive role from maturity persona ───────────
export function detectExecutiveProfile(
  persona: MaturityPersona
): ExecutiveProfile {
  if (persona === "executive_stakeholder") {
    return EXECUTIVE_PROFILES.CFO;
  }
  if (persona === "transformation_leader") {
    return EXECUTIVE_PROFILES.CPO;
  }
  if (persona === "advanced_analyst") {
    return EXECUTIVE_PROFILES.procurement_director;
  }
  if (persona === "strategic_sourcer") {
    return EXECUTIVE_PROFILES.category_manager;
  }
  return EXECUTIVE_PROFILES.general;
}

// ── Executive headline per role and locale ────────────────
export const EXECUTIVE_HEADLINES: Record<ExecutiveRole, Record<Locale, string>> = {
  CFO: {
    pl: "Jak zakupy wpływają na Twój EBIT?",
    en: "How does procurement impact your EBIT?",
  },
  CEO: {
    pl: "Zakupy jako strategiczna przewaga konkurencyjna",
    en: "Procurement as strategic competitive advantage",
  },
  CPO: {
    pl: "Budowanie doskonałości zakupowej — od strategii do egzekucji",
    en: "Building procurement excellence — from strategy to execution",
  },
  procurement_director: {
    pl: "Fact-based negocjacje i strategic sourcing w Twojej organizacji",
    en: "Fact-based negotiation and strategic sourcing in your organisation",
  },
  category_manager: {
    pl: "Category mastery: should-cost, benchmarking, negocjacje",
    en: "Category mastery: should-cost, benchmarking, negotiations",
  },
  general: {
    pl: "Procurement advisory dopasowany do Twojej sytuacji",
    en: "Procurement advisory tailored to your situation",
  },
};

// ── Advisory content strings by locale ───────────────────
export const ADVISORY_CONTENT = {
  pl: {
    // Phase labels for UI
    phases: {
      idle: "Gotowy do rozmowy",
      opening: "Rozpoczynamy",
      intent_discovery: "Rozumiem kontekst",
      problem_framing: "Analizuję problem",
      capability_recommendation: "Rekomendacje",
      objection_handling: "Odpowiadam na pytania",
      escalation: "Czas na rozmowę",
      post_escalation: "Kolejny krok",
    },

    // Maturity persona labels
    personas: {
      reactive_buyer: "Organizacja reaktywna",
      operational_buyer: "Kupiec operacyjny",
      strategic_sourcer: "Strategic sourcer",
      advanced_analyst: "Analytyk zakupowy",
      executive_stakeholder: "Decydent biznesowy",
      transformation_leader: "Lider transformacji",
      unknown: "Odkrywam Twój profil",
    },

    // Advisory tone labels
    tones: {
      diagnostic: "Diagnostyczny",
      analytical: "Analityczny",
      strategic: "Strategiczny",
      executive: "Kadra zarządzająca",
      peer: "Partnerski",
    },

    // Section labels for adaptive page
    sections: {
      hero: "Strona główna",
      services_overview: "Usługi",
      capability_block: "Kompetencje",
      case_study: "Case study",
      proof_point: "Dowody",
      pricing: "Cennik",
      workshop: "Warsztaty",
      cta_section: "Następny krok",
      benchmark: "Benchmarki",
      about: "O nas",
      footer_cta: "Działaj",
      navigation: "Nawigacja",
      testimonial: "Referencje",
      roi_block: "ROI",
    },

    // Common UI strings
    ui: {
      advisoryLayerLabel: "Doradca kontekstowy",
      widgetClose: "Zamknij",
      widgetExpand: "Rozwiń",
      navigationHintPrefix: "Sugerowany kolejny krok:",
      capabilityDiscoveryTitle: "Odkryj powiązane obszary",
      executiveModeLabel: "Tryb executive",
      learnMore: "Dowiedz się więcej →",
      contactUs: "Skontaktuj się →",
      bookWorkshop: "Zarezerwuj warsztat →",
      seeCapability: "Zobacz kompetencję →",
    },
  },

  en: {
    phases: {
      idle: "Ready to advise",
      opening: "Getting started",
      intent_discovery: "Understanding your context",
      problem_framing: "Analysing the problem",
      capability_recommendation: "Recommendations",
      objection_handling: "Answering your questions",
      escalation: "Time to connect",
      post_escalation: "Next step",
    },

    personas: {
      reactive_buyer: "Reactive organisation",
      operational_buyer: "Operational buyer",
      strategic_sourcer: "Strategic sourcer",
      advanced_analyst: "Procurement analyst",
      executive_stakeholder: "Business decision-maker",
      transformation_leader: "Transformation leader",
      unknown: "Discovering your profile",
    },

    tones: {
      diagnostic: "Diagnostic",
      analytical: "Analytical",
      strategic: "Strategic",
      executive: "Executive",
      peer: "Peer-level",
    },

    sections: {
      hero: "Home",
      services_overview: "Services",
      capability_block: "Capabilities",
      case_study: "Case study",
      proof_point: "Proof points",
      pricing: "Pricing",
      workshop: "Workshops",
      cta_section: "Next step",
      benchmark: "Benchmarks",
      about: "About",
      footer_cta: "Take action",
      navigation: "Navigation",
      testimonial: "Testimonials",
      roi_block: "ROI",
    },

    ui: {
      advisoryLayerLabel: "Contextual advisor",
      widgetClose: "Close",
      widgetExpand: "Expand",
      navigationHintPrefix: "Suggested next step:",
      capabilityDiscoveryTitle: "Discover related areas",
      executiveModeLabel: "Executive mode",
      learnMore: "Learn more →",
      contactUs: "Contact us →",
      bookWorkshop: "Book a workshop →",
      seeCapability: "See capability →",
    },
  },
} as const satisfies Record<Locale, unknown>;
