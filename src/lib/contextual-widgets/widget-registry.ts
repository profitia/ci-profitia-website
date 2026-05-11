// ─────────────────────────────────────────────────────────
// CI-Profitia — Contextual Widget Registry
// All contextual intelligence widgets — PL + EN,
// intent-aware, maturity-aware, executive-aware.
// ─────────────────────────────────────────────────────────

import type { ContextualWidget } from "@/types";

export const WIDGET_REGISTRY: ContextualWidget[] = [

  // ══════════════════════════════════════════════════════
  // BENCHMARK INSIGHTS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-BM-01-pl",
    type: "benchmark_insight",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    locale: "pl",
    title: "Benchmark rynkowy: oszczędności w pierwszym roku",
    content: "Organizacje, które wdrażają fact-based negotiation approach, raportują oszczędności 4–12% w pierwszym roku od projektu diagnostycznego. Kluczowe: widoczność kategorii i pozycja kosztowa.",
    metrics: [
      { label: "Oszczędności Year 1", value: "4–12%" },
      { label: "Czas realizacji projektu", value: "6–12 tygodni" },
    ],
    cta: { label: "Sprawdź swój potencjał", url: "/services/analiza-spot", type: "spot_analysis" },
    priority: 9,
    tags: ["benchmark", "savings", "year1", "negotiation"],
  },
  {
    id: "WG-BM-01-en",
    type: "benchmark_insight",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    locale: "en",
    title: "Market benchmark: Year 1 savings",
    content: "Organisations implementing a fact-based negotiation approach report 4–12% savings in the first year following a diagnostic project. Key enablers: category visibility and cost position.",
    metrics: [
      { label: "Year 1 savings", value: "4–12%" },
      { label: "Project delivery time", value: "6–12 weeks" },
    ],
    cta: { label: "Check your potential", url: "/services/analiza-spot", type: "spot_analysis" },
    priority: 9,
    tags: ["benchmark", "savings", "year1", "negotiation"],
  },

  {
    id: "WG-BM-02-pl",
    type: "benchmark_insight",
    intents: ["I3_SUPPLIER_RISK"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst", "executive_stakeholder"],
    locale: "pl",
    title: "Benchmark: ryzyko dostawcy w polskim manufacturing",
    content: "30% organizacji produkcyjnych doświadcza przynajmniej jednego poważnego incydentu dostawczego w ciągu 3 lat. Systematyczny monitoring C/D-grade suppliers pozwala zredukować to ryzyko o ponad połowę.",
    metrics: [
      { label: "Incydenty dostawcze/3 lata", value: "30% firm" },
      { label: "Redukcja ryzyka przez monitoring", value: ">50%" },
    ],
    cta: { label: "Zobacz Supplier Intelligence", url: "/services/supplier-intelligence", type: "service_order" },
    priority: 8,
    tags: ["benchmark", "supplier-risk", "manufacturing", "monitoring"],
  },
  {
    id: "WG-BM-02-en",
    type: "benchmark_insight",
    intents: ["I3_SUPPLIER_RISK"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst", "executive_stakeholder"],
    locale: "en",
    title: "Benchmark: supplier risk in manufacturing",
    content: "30% of manufacturing organisations experience at least one serious supplier incident within 3 years. Systematic monitoring of C/D-grade suppliers can reduce this risk by more than half.",
    metrics: [
      { label: "Supplier incidents / 3 years", value: "30% of companies" },
      { label: "Risk reduction via monitoring", value: ">50%" },
    ],
    cta: { label: "See Supplier Intelligence", url: "/services/supplier-intelligence", type: "service_order" },
    priority: 8,
    tags: ["benchmark", "supplier-risk", "manufacturing", "monitoring"],
  },

  // ══════════════════════════════════════════════════════
  // ROI INSIGHTS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-ROI-01-pl",
    type: "roi_insight",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I5_SOURCING"],
    maturityPersonas: ["executive_stakeholder", "transformation_leader"],
    locale: "pl",
    title: "ROI z procurement advisory — jak to działa?",
    content: "Projekty advisory Profitia generują zwrot w 3 głównych mechanizmach: bezpośrednie oszczędności negocjacyjne, uniknięte koszty ryzyka dostawcy i poprawa efektywności procesowej. Kombinacja tych trzech elementów zwykle daje ROI 3–8x koszt projektu.",
    metrics: [
      { label: "Typowy ROI", value: "3–8x koszt projektu" },
      { label: "Payback period", value: "3–12 miesięcy" },
    ],
    cta: { label: "Omów swój business case", url: "/contact", type: "contact_form" },
    priority: 10,
    executiveRoles: ["CFO", "CEO"],
    tags: ["roi", "executive", "business-case", "payback"],
  },
  {
    id: "WG-ROI-01-en",
    type: "roi_insight",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I5_SOURCING"],
    maturityPersonas: ["executive_stakeholder", "transformation_leader"],
    locale: "en",
    title: "ROI from procurement advisory — how it works",
    content: "Profitia advisory projects generate returns through 3 core mechanisms: direct negotiation savings, avoided supplier risk costs, and process efficiency improvement. The combination typically delivers ROI of 3–8x the project cost.",
    metrics: [
      { label: "Typical ROI", value: "3–8x project cost" },
      { label: "Payback period", value: "3–12 months" },
    ],
    cta: { label: "Discuss your business case", url: "/contact", type: "contact_form" },
    priority: 10,
    executiveRoles: ["CFO", "CEO"],
    tags: ["roi", "executive", "business-case", "payback"],
  },

  // ══════════════════════════════════════════════════════
  // WORKSHOP RECOMMENDATIONS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-WS-01-pl",
    type: "workshop_recommendation",
    intents: ["I6_EDUCATION", "I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
    locale: "pl",
    title: "Warsztat negocjacyjny — Harvard Methodology",
    content: "2-dniowy intensywny program negocjacyjny dla kupców i category managerów. Oparty na metodzie harwardzkiej, z realistycznymi scenariuszami branżowymi i live negocjacjami.",
    metrics: [
      { label: "Czas trwania", value: "2 dni" },
      { label: "Uczestnicy", value: "8–16 osób" },
    ],
    cta: { label: "Zapytaj o termin", url: "/education/warsztaty-negocjacyjne", type: "workshop" },
    priority: 7,
    tags: ["workshop", "negotiation", "harvard", "team"],
  },
  {
    id: "WG-WS-01-en",
    type: "workshop_recommendation",
    intents: ["I6_EDUCATION", "I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
    locale: "en",
    title: "Negotiation Workshop — Harvard Methodology",
    content: "An intensive 2-day negotiation programme for buyers and category managers. Harvard-based methodology with realistic industry scenarios and live negotiation exercises.",
    metrics: [
      { label: "Duration", value: "2 days" },
      { label: "Participants", value: "8–16 people" },
    ],
    cta: { label: "Ask about scheduling", url: "/education/warsztaty-negocjacyjne", type: "workshop" },
    priority: 7,
    tags: ["workshop", "negotiation", "harvard", "team"],
  },

  // ══════════════════════════════════════════════════════
  // TRANSFORMATION PROMPTS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-TR-01-pl",
    type: "transformation_prompt",
    intents: ["I5_SOURCING", "I4_DIGITALIZATION"],
    maturityPersonas: ["advanced_analyst", "executive_stakeholder", "transformation_leader"],
    locale: "pl",
    title: "Gotowość do transformacji procurement?",
    content: "Procurement Excellence Assessment pozwala zmierzyć aktualny stan dojrzałości organizacji zakupowej w 5 wymiarach: strategia, analityka, procesy, kompetencje i governance. Diagnoza trwa 2–3 tygodnie.",
    cta: { label: "Zamów assessment", url: "/contact", type: "contact_form" },
    priority: 8,
    executiveRoles: ["CPO", "CEO", "procurement_director"],
    tags: ["transformation", "assessment", "maturity", "excellence"],
  },
  {
    id: "WG-TR-01-en",
    type: "transformation_prompt",
    intents: ["I5_SOURCING", "I4_DIGITALIZATION"],
    maturityPersonas: ["advanced_analyst", "executive_stakeholder", "transformation_leader"],
    locale: "en",
    title: "Ready for procurement transformation?",
    content: "The Procurement Excellence Assessment measures your organisation's current procurement maturity across 5 dimensions: strategy, analytics, processes, capabilities and governance. Diagnosis takes 2–3 weeks.",
    cta: { label: "Order an assessment", url: "/contact", type: "contact_form" },
    priority: 8,
    executiveRoles: ["CPO", "CEO", "procurement_director"],
    tags: ["transformation", "assessment", "maturity", "excellence"],
  },

  // ══════════════════════════════════════════════════════
  // SUPPLIER RISK INSIGHTS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-SR-01-pl",
    type: "supplier_risk_insight",
    intents: ["I3_SUPPLIER_RISK"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
    locale: "pl",
    title: "Sygnały ryzyka, które przeoczyłeś",
    content: "Typowe wczesne sygnały problemów finansowych dostawcy: wydłużające się terminy realizacji, częstsze renegocjacje warunków, zmiana osoby kontaktowej, opóźnienia informacyjne. Każdy z tych sygnałów pojawia się zazwyczaj 6–18 miesięcy przed kryzysem.",
    cta: { label: "Sprawdź swoich dostawców", url: "/services/supplier-intelligence", type: "service_order" },
    priority: 8,
    tags: ["supplier-risk", "early-warning", "signals", "monitoring"],
  },
  {
    id: "WG-SR-01-en",
    type: "supplier_risk_insight",
    intents: ["I3_SUPPLIER_RISK"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
    locale: "en",
    title: "Risk signals you may have missed",
    content: "Typical early warning signs of supplier financial distress: extending lead times, more frequent renegotiations, change of contact person, information delays. Each signal typically appears 6–18 months before a crisis.",
    cta: { label: "Check your suppliers", url: "/services/supplier-intelligence", type: "service_order" },
    priority: 8,
    tags: ["supplier-risk", "early-warning", "signals", "monitoring"],
  },

  // ══════════════════════════════════════════════════════
  // EXECUTIVE SUMMARIES
  // ══════════════════════════════════════════════════════

  {
    id: "WG-EX-01-pl",
    type: "executive_summary",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK", "I5_SOURCING"],
    maturityPersonas: ["executive_stakeholder"],
    locale: "pl",
    title: "Procurement jako dźwignia EBIT",
    content: "Dla organizacji z external spend powyżej 100M PLN, poprawa efektywności zakupowej o 2–3pp bezpośrednio przekłada się na wzrost EBIT. To często więcej niż osiągalne przez wzrost sprzedaży w tym samym czasie.",
    metrics: [
      { label: "Dźwignia EBIT", value: "2–3pp zakupów = 10–20% EBIT" },
      { label: "Czas realizacji", value: "12–24 miesiące" },
    ],
    cta: { label: "Porozmawiajmy o strategii", url: "/contact", type: "contact_form" },
    priority: 10,
    executiveRoles: ["CFO", "CEO", "CPO"],
    tags: ["executive", "ebit", "strategic", "cfo", "ceo"],
  },
  {
    id: "WG-EX-01-en",
    type: "executive_summary",
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK", "I5_SOURCING"],
    maturityPersonas: ["executive_stakeholder"],
    locale: "en",
    title: "Procurement as an EBIT lever",
    content: "For organisations with external spend above EUR 25M, improving procurement efficiency by 2–3pp directly translates to EBIT growth. This often exceeds what is achievable through revenue growth in the same period.",
    metrics: [
      { label: "EBIT leverage", value: "2–3pp procurement = 10–20% EBIT" },
      { label: "Delivery timeline", value: "12–24 months" },
    ],
    cta: { label: "Let's discuss the strategy", url: "/contact", type: "contact_form" },
    priority: 10,
    executiveRoles: ["CFO", "CEO", "CPO"],
    tags: ["executive", "ebit", "strategic", "cfo", "ceo"],
  },

  // ══════════════════════════════════════════════════════
  // CAPABILITY TEASERS
  // ══════════════════════════════════════════════════════

  {
    id: "WG-CAP-01-pl",
    type: "capability_teaser",
    intents: ["I7_EXPLORATORY", "UNKNOWN"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "unknown"],
    locale: "pl",
    title: "Od czego zaczynają organizacje podobne do Twojej?",
    content: "W organizacjach z podobnym profilem zakupowym pierwszym krokiem jest zazwyczaj Analiza SPOT — 5–10 dni roboczych od Twoich danych do konkretnych rekomendacji. Bez zobowiązań, z pełnym ROI na wyjściu.",
    cta: { label: "Poznaj SPOT Analysis", url: "/services/analiza-spot", type: "spot_analysis" },
    priority: 6,
    tags: ["discovery", "exploratory", "first-step", "spot"],
  },
  {
    id: "WG-CAP-01-en",
    type: "capability_teaser",
    intents: ["I7_EXPLORATORY", "UNKNOWN"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "unknown"],
    locale: "en",
    title: "Where do organisations similar to yours start?",
    content: "In organisations with a similar procurement profile, the first step is usually SPOT Analysis — 5–10 working days from your data to concrete recommendations. No commitment required, with full ROI delivered.",
    cta: { label: "Explore SPOT Analysis", url: "/services/analiza-spot", type: "spot_analysis" },
    priority: 6,
    tags: ["discovery", "exploratory", "first-step", "spot"],
  },

  // ══════════════════════════════════════════════════════
  // DIAGNOSTIC
  // ══════════════════════════════════════════════════════

  {
    id: "WG-DG-01-pl",
    type: "diagnostic",
    intents: ["I7_EXPLORATORY", "I1_SAVINGS", "I8_NEGOTIATIONS"],
    maturityPersonas: ["reactive_buyer", "unknown"],
    locale: "pl",
    title: "Nie wiesz jeszcze od czego zacząć?",
    content: "To normalne — większość organizacji nie ma pełnego obrazu swojego problemu zakupowego na początku. Krótka rozmowa z doradcą wystarczy żeby ustalić priorytety i zaproponować pierwszy krok.",
    cta: { label: "Umów bezpłatną konsultację", url: "/contact", type: "contact_form" },
    priority: 5,
    tags: ["diagnostic", "discovery", "consultation", "start"],
  },
  {
    id: "WG-DG-01-en",
    type: "diagnostic",
    intents: ["I7_EXPLORATORY", "I1_SAVINGS", "I8_NEGOTIATIONS"],
    maturityPersonas: ["reactive_buyer", "unknown"],
    locale: "en",
    title: "Not sure where to start?",
    content: "That's normal — most organisations don't have a complete picture of their procurement challenge at the outset. A short conversation with an advisor is enough to establish priorities and propose a first step.",
    cta: { label: "Book a free consultation", url: "/contact", type: "contact_form" },
    priority: 5,
    tags: ["diagnostic", "discovery", "consultation", "start"],
  },
];
