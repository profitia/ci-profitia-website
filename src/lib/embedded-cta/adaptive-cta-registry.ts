// ─────────────────────────────────────────────────────────
// CI-Profitia — Adaptive CTA Registry
// Persona-aware, maturity-aware, executive-aware CTA configs.
// PL + EN, intent-driven, escalation-sensitive.
// ─────────────────────────────────────────────────────────

import type { AdaptiveCTAConfig } from "@/types";

export const ADAPTIVE_CTA_REGISTRY: AdaptiveCTAConfig[] = [

  // ── Reactive / Exploratory ────────────────────────────
  {
    id: "ACTA-01",
    label: {
      pl: "Porozmawiajmy o problemie",
      en: "Let's talk about your challenge",
    },
    subLabel: {
      pl: "Bezpłatna konsultacja, bez zobowiązań",
      en: "Free consultation, no commitment",
    },
    url: "/contact",
    type: "contact_form",
    urgencyFit: ["U2", "U3"],
    maturityPersonas: ["reactive_buyer", "unknown"],
    intents: ["I7_EXPLORATORY", "UNKNOWN", "I1_SAVINGS", "I8_NEGOTIATIONS"],
    strength: 6,
  },

  // ── Operational — diagnostic fast-track ───────────────
  {
    id: "ACTA-02",
    label: {
      pl: "Zacznij od analizy SPOT",
      en: "Start with a SPOT Analysis",
    },
    subLabel: {
      pl: "5–10 dni roboczych do rekomendacji",
      en: "5–10 working days to recommendations",
    },
    url: "/services/analiza-spot",
    type: "spot_analysis",
    urgencyFit: ["U1", "U2"],
    maturityPersonas: ["operational_buyer", "reactive_buyer"],
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    strength: 8,
  },

  // ── Strategic sourcer — workshop ──────────────────────
  {
    id: "ACTA-03",
    label: {
      pl: "Umów workshop should-cost",
      en: "Book a should-cost workshop",
    },
    subLabel: {
      pl: "Harvard methodology, realne case studies",
      en: "Harvard methodology, real case studies",
    },
    url: "/education/warsztaty-negocjacyjne",
    type: "workshop",
    urgencyFit: ["U2", "U3"],
    maturityPersonas: ["strategic_sourcer", "operational_buyer"],
    intents: ["I8_NEGOTIATIONS", "I6_EDUCATION"],
    strength: 7,
  },

  // ── Advanced analyst — spend analytics ────────────────
  {
    id: "ACTA-04",
    label: {
      pl: "Zbuduj Spend Cube",
      en: "Build your Spend Cube",
    },
    subLabel: {
      pl: "Od danych do widoczności kategorii",
      en: "From data to category visibility",
    },
    url: "/services/spend-cube",
    type: "service_order",
    urgencyFit: ["U2", "U3"],
    maturityPersonas: ["advanced_analyst", "strategic_sourcer"],
    intents: ["I2_FORECASTING", "I1_SAVINGS"],
    strength: 7,
  },

  // ── Executive — EBIT conversation ─────────────────────
  {
    id: "ACTA-05",
    label: {
      pl: "Zobacz wpływ procurement na EBIT",
      en: "See procurement's impact on EBIT",
    },
    subLabel: {
      pl: "Rozmowa z doradcą na poziomie C-suite",
      en: "Conversation with advisor at C-suite level",
    },
    url: "/contact",
    type: "contact_form",
    urgencyFit: ["U1", "U2", "U3"],
    maturityPersonas: ["executive_stakeholder"],
    executiveRoles: ["CFO", "CEO"],
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I5_SOURCING", "I3_SUPPLIER_RISK"],
    strength: 10,
  },

  // ── Executive CPO — transformation ───────────────────
  {
    id: "ACTA-06",
    label: {
      pl: "Porozmawiajmy o transformacji",
      en: "Let's discuss transformation",
    },
    subLabel: {
      pl: "Strategic procurement design",
      en: "Strategic procurement design",
    },
    url: "/contact",
    type: "contact_form",
    urgencyFit: ["U1", "U2"],
    maturityPersonas: ["transformation_leader", "executive_stakeholder"],
    executiveRoles: ["CPO", "CEO"],
    intents: ["I5_SOURCING", "I4_DIGITALIZATION"],
    strength: 10,
  },

  // ── Supplier risk ─────────────────────────────────────
  {
    id: "ACTA-07",
    label: {
      pl: "Sprawdź kondycję swoich dostawców",
      en: "Check your supplier health",
    },
    subLabel: {
      pl: "Supplier Intelligence — scoring i wczesne ostrzeżenia",
      en: "Supplier Intelligence — scoring and early warnings",
    },
    url: "/services/supplier-intelligence",
    type: "service_order",
    urgencyFit: ["U1", "U2"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    intents: ["I3_SUPPLIER_RISK"],
    strength: 9,
  },

  // ── Urgent — direct contact ───────────────────────────
  {
    id: "ACTA-08",
    label: {
      pl: "Zadzwoń teraz",
      en: "Call us now",
    },
    url: "tel:+48533747340",
    type: "phone",
    urgencyFit: ["U1"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer", "executive_stakeholder"],
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK"],
    strength: 10,
  },

  // ── Procurement director — category strategy ──────────
  {
    id: "ACTA-09",
    label: {
      pl: "Zaprojektuj category strategy",
      en: "Design your category strategy",
    },
    subLabel: {
      pl: "Portfolio view z perspektywą wartości i ryzyka",
      en: "Portfolio view with value and risk perspective",
    },
    url: "/services/category-strategy",
    type: "service_order",
    urgencyFit: ["U2", "U3"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
    executiveRoles: ["CPO", "procurement_director", "category_manager"],
    intents: ["I5_SOURCING"],
    strength: 8,
  },

  // ── Coaching / mentoring ──────────────────────────────
  {
    id: "ACTA-10",
    label: {
      pl: "Zapytaj o mentoring zakupowy",
      en: "Ask about procurement mentoring",
    },
    url: "/services/coaching-zakupowy",
    type: "coaching",
    urgencyFit: ["U2", "U3"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
    intents: ["I6_EDUCATION"],
    strength: 5,
  },
];
