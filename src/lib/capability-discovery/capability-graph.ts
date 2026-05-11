// ─────────────────────────────────────────────────────────
// CI-Profitia — Capability Graph
// Directed graph of Profitia capabilities.
// Each node = a service/product with intent, maturity,
// relationships and advisory journey paths.
// ─────────────────────────────────────────────────────────

import type { CapabilityEdge, CapabilityNode } from "@/types";

export const CAPABILITY_NODES: CapabilityNode[] = [

  // ── Cost Intelligence ─────────────────────────────────

  {
    id: "CAP-SPOT",
    slug: "/services/analiza-spot",
    name: { pl: "Analiza SPOT", en: "SPOT Analysis" },
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
    description: {
      pl: "Szybka diagnoza 5–10 dni: kategorie, dostawcy, potencjał oszczędnościowy i dźwignia negocjacyjna.",
      en: "Fast 5–10-day diagnostic: categories, suppliers, savings potential and negotiation leverage.",
    },
    shortLabel: { pl: "Diagnoza zakupowa", en: "Procurement diagnostic" },
    relatedIds: ["CAP-SHOULD-COST", "CAP-SPEND-CUBE", "CAP-NEG-PREP"],
    advisoryPathNext: ["CAP-SHOULD-COST", "CAP-NEG-PREP"],
    executiveRelevance: ["CFO", "CEO", "procurement_director"],
    tags: ["diagnostic", "fast-track", "cost", "savings"],
  },

  {
    id: "CAP-SHOULD-COST",
    slug: "/services/should-cost-analysis",
    name: { pl: "Should-Cost Analysis", en: "Should-Cost Analysis" },
    intents: ["I8_NEGOTIATIONS", "I1_SAVINGS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Modelowanie rzeczywistej struktury kosztowej produktu — daje pozycję kosztową przed negocjacjami.",
      en: "Modelling the true cost structure of a product — delivers the cost position before negotiations.",
    },
    shortLabel: { pl: "Analiza kosztowa", en: "Cost analysis" },
    relatedIds: ["CAP-SPOT", "CAP-NEG-PREP", "CAP-BENCH"],
    advisoryPathNext: ["CAP-NEG-PREP", "CAP-NEG-SUPPORT"],
    executiveRelevance: ["CPO", "procurement_director", "category_manager"],
    tags: ["should-cost", "cost-intelligence", "negotiation-leverage"],
  },

  {
    id: "CAP-NEG-PREP",
    slug: "/services/negotiation-preparation",
    name: { pl: "Przygotowanie negocjacyjne", en: "Negotiation Preparation" },
    intents: ["I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Kompletny playbook negocjacyjny — profil dostawcy, pozycja kosztowa, strategia argumentacji, briefing zespołu.",
      en: "Complete negotiation playbook — supplier profile, cost position, argumentation strategy, team briefing.",
    },
    shortLabel: { pl: "Playbook negocjacyjny", en: "Negotiation playbook" },
    relatedIds: ["CAP-SHOULD-COST", "CAP-NEG-SUPPORT", "CAP-BENCH"],
    advisoryPathNext: ["CAP-NEG-SUPPORT"],
    executiveRelevance: ["CPO", "procurement_director", "category_manager"],
    tags: ["negotiation", "preparation", "playbook"],
  },

  {
    id: "CAP-NEG-SUPPORT",
    slug: "/services/supplier-negotiation-support",
    name: { pl: "Wsparcie negocjacji", en: "Negotiation Support" },
    intents: ["I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
    description: {
      pl: "Wsparcie hands-on podczas negocjacji — coaching pozycji, doradztwo w czasie rzeczywistym, zarządzanie ustępstwami.",
      en: "Hands-on support during negotiations — position coaching, real-time advisory, concession management.",
    },
    shortLabel: { pl: "Wsparcie w negocjacjach", en: "Live negotiation support" },
    relatedIds: ["CAP-NEG-PREP", "CAP-SHOULD-COST"],
    advisoryPathNext: ["CAP-CAT-STRATEGY"],
    executiveRelevance: ["procurement_director", "category_manager"],
    tags: ["negotiation", "live-support", "concessions"],
  },

  {
    id: "CAP-BENCH",
    slug: "/services/supplier-benchmarking",
    name: { pl: "Benchmarking dostawców", en: "Supplier Benchmarking" },
    intents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Porównanie cenowe i jakościowe dostawców w kategorii — rynkowe punkty odniesienia dla negocjacji.",
      en: "Price and quality comparison of suppliers in a category — market reference points for negotiations.",
    },
    shortLabel: { pl: "Benchmarking", en: "Benchmarking" },
    relatedIds: ["CAP-SPOT", "CAP-SHOULD-COST", "CAP-SUPPLIER-INTEL"],
    advisoryPathNext: ["CAP-NEG-PREP", "CAP-CAT-STRATEGY"],
    executiveRelevance: ["CPO", "procurement_director", "category_manager"],
    tags: ["benchmarking", "market-data", "supplier-comparison"],
  },

  // ── Spend Analytics ───────────────────────────────────

  {
    id: "CAP-SPEND-CUBE",
    slug: "/services/spend-cube",
    name: { pl: "Spend Cube", en: "Spend Cube" },
    intents: ["I2_FORECASTING", "I1_SAVINGS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Multidimensionalna struktura spend — kategoria, dostawca, SKU, centrum kosztów. Fundament analytics.",
      en: "Multidimensional spend structure — category, supplier, SKU, cost centre. The analytics foundation.",
    },
    shortLabel: { pl: "Spend Cube", en: "Spend Cube" },
    relatedIds: ["CAP-SPOT", "CAP-DASHBOARDS", "CAP-KPI"],
    advisoryPathNext: ["CAP-DASHBOARDS", "CAP-CAT-STRATEGY"],
    executiveRelevance: ["CFO", "CPO", "procurement_director"],
    tags: ["spend-analytics", "data", "visibility", "cube"],
  },

  {
    id: "CAP-DASHBOARDS",
    slug: "/services/procurement-dashboards",
    name: { pl: "Dashboardy zakupowe", en: "Procurement Dashboards" },
    intents: ["I2_FORECASTING", "I1_SAVINGS"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Operacyjne dashboardy zakupowe — savings tracking, supplier performance, spend predictability.",
      en: "Operational procurement dashboards — savings tracking, supplier performance, spend predictability.",
    },
    shortLabel: { pl: "Dashboardy", en: "Dashboards" },
    relatedIds: ["CAP-SPEND-CUBE", "CAP-KPI", "CAP-ANALYTICS"],
    advisoryPathNext: ["CAP-KPI", "CAP-CAT-STRATEGY"],
    executiveRelevance: ["CFO", "CPO"],
    tags: ["dashboards", "reporting", "savings-tracking", "kpi"],
  },

  {
    id: "CAP-ANALYTICS",
    slug: "/services/spend-analytics",
    name: { pl: "Spend Analytics", en: "Spend Analytics" },
    intents: ["I2_FORECASTING", "I1_SAVINGS"],
    maturityPersonas: ["advanced_analyst", "transformation_leader"],
    description: {
      pl: "Zaawansowana analityka spend z modelami predykcyjnymi i identyfikacją anomalii.",
      en: "Advanced spend analytics with predictive models and anomaly identification.",
    },
    shortLabel: { pl: "Analytics zaawansowany", en: "Advanced analytics" },
    relatedIds: ["CAP-SPEND-CUBE", "CAP-DASHBOARDS"],
    advisoryPathNext: ["CAP-CAT-STRATEGY", "CAP-TRANSFORMATION"],
    executiveRelevance: ["CFO", "CPO"],
    tags: ["analytics", "predictive", "advanced", "data-driven"],
  },

  {
    id: "CAP-KPI",
    slug: "/services/procurement-kpi-systems",
    name: { pl: "KPI zakupowe", en: "Procurement KPI Systems" },
    intents: ["I2_FORECASTING", "I5_SOURCING"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Systemy wskaźników zakupowych — od procurement savings do supplier performance i SLA compliance.",
      en: "Procurement KPI systems — from procurement savings to supplier performance and SLA compliance.",
    },
    shortLabel: { pl: "KPI zakupowe", en: "Procurement KPIs" },
    relatedIds: ["CAP-DASHBOARDS", "CAP-CAT-STRATEGY"],
    advisoryPathNext: ["CAP-CAT-STRATEGY"],
    executiveRelevance: ["CFO", "CPO", "procurement_director"],
    tags: ["kpi", "measurement", "performance", "governance"],
  },

  // ── Supplier Risk ─────────────────────────────────────

  {
    id: "CAP-SUPPLIER-INTEL",
    slug: "/services/supplier-intelligence",
    name: { pl: "Supplier Intelligence", en: "Supplier Intelligence" },
    intents: ["I3_SUPPLIER_RISK"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer", "advanced_analyst", "executive_stakeholder"],
    description: {
      pl: "Monitoring kondycji finansowej dostawców — wczesne sygnały ryzyka, scoring, alert system.",
      en: "Supplier financial health monitoring — early risk signals, scoring, alert system.",
    },
    shortLabel: { pl: "Ryzyko dostawców", en: "Supplier risk" },
    relatedIds: ["CAP-BENCH", "CAP-TRANSFORMATION"],
    advisoryPathNext: ["CAP-BENCH", "CAP-CAT-STRATEGY"],
    executiveRelevance: ["CEO", "CFO", "CPO", "procurement_director"],
    tags: ["supplier-risk", "monitoring", "early-warning", "intelligence"],
  },

  // ── Strategic & Transformation ────────────────────────

  {
    id: "CAP-CAT-STRATEGY",
    slug: "/services/category-strategy",
    name: { pl: "Category Strategy", en: "Category Strategy" },
    intents: ["I5_SOURCING", "I1_SAVINGS"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst", "transformation_leader"],
    description: {
      pl: "Pełna strategia kategorii zakupowej — portfolio view, supplier development, savings roadmap.",
      en: "Full procurement category strategy — portfolio view, supplier development, savings roadmap.",
    },
    shortLabel: { pl: "Strategia kategorii", en: "Category strategy" },
    relatedIds: ["CAP-SPOT", "CAP-SHOULD-COST", "CAP-TRANSFORMATION"],
    advisoryPathNext: ["CAP-TRANSFORMATION"],
    executiveRelevance: ["CPO", "procurement_director", "category_manager"],
    tags: ["category-strategy", "sourcing", "portfolio", "strategic"],
  },

  {
    id: "CAP-TRANSFORMATION",
    slug: "/services/procurement-transformation",
    name: { pl: "Procurement Transformation", en: "Procurement Transformation" },
    intents: ["I5_SOURCING", "I4_DIGITALIZATION"],
    maturityPersonas: ["advanced_analyst", "executive_stakeholder", "transformation_leader"],
    description: {
      pl: "Transformacja działu zakupów — strategia, procesy, governance, kompetencje i cyfryzacja.",
      en: "Procurement department transformation — strategy, processes, governance, capabilities and digitalisation.",
    },
    shortLabel: { pl: "Transformacja", en: "Transformation" },
    relatedIds: ["CAP-CAT-STRATEGY", "CAP-PMO"],
    advisoryPathNext: ["CAP-PMO"],
    executiveRelevance: ["CEO", "CPO", "CFO"],
    tags: ["transformation", "excellence", "strategic", "digitalization"],
  },

  {
    id: "CAP-PMO",
    slug: "/services/procurement-pmo",
    name: { pl: "Procurement PMO", en: "Procurement PMO" },
    intents: ["I5_SOURCING", "I4_DIGITALIZATION"],
    maturityPersonas: ["transformation_leader"],
    description: {
      pl: "Zarządzanie portfelem projektów zakupowych — governance, milestones, value delivery tracking.",
      en: "Procurement project portfolio management — governance, milestones, value delivery tracking.",
    },
    shortLabel: { pl: "PMO zakupowe", en: "Procurement PMO" },
    relatedIds: ["CAP-TRANSFORMATION"],
    advisoryPathNext: [],
    executiveRelevance: ["CEO", "CPO"],
    tags: ["pmo", "governance", "portfolio", "transformation"],
  },

  // ── Education ─────────────────────────────────────────

  {
    id: "CAP-NEG-WORKSHOP",
    slug: "/education/warsztaty-negocjacyjne",
    name: { pl: "Warsztaty negocjacyjne", en: "Negotiation Workshops" },
    intents: ["I6_EDUCATION", "I8_NEGOTIATIONS"],
    maturityPersonas: ["operational_buyer", "strategic_sourcer"],
    description: {
      pl: "Harvard-methodology — warsztaty negocjacyjne dla kupców i category managerów.",
      en: "Harvard methodology — negotiation workshops for buyers and category managers.",
    },
    shortLabel: { pl: "Warsztaty negocjacyjne", en: "Negotiation workshops" },
    relatedIds: ["CAP-NEG-PREP", "CAP-INCO"],
    advisoryPathNext: ["CAP-NEG-PREP"],
    executiveRelevance: ["procurement_director", "category_manager"],
    tags: ["workshop", "negotiation", "harvard", "education"],
  },

  {
    id: "CAP-INCO",
    slug: "/education/in-company-workshops",
    name: { pl: "Warsztaty in-company", en: "In-Company Workshops" },
    intents: ["I6_EDUCATION"],
    maturityPersonas: ["reactive_buyer", "operational_buyer", "strategic_sourcer"],
    description: {
      pl: "Programy edukacyjne projektowane pod konkretną organizację — z realnymi case studies.",
      en: "Education programmes designed for a specific organisation — using real case studies.",
    },
    shortLabel: { pl: "In-company", en: "In-company" },
    relatedIds: ["CAP-NEG-WORKSHOP", "CAP-PROCUREMENT-EXCELLENCE"],
    advisoryPathNext: ["CAP-PROCUREMENT-EXCELLENCE"],
    executiveRelevance: ["CPO", "procurement_director"],
    tags: ["in-company", "education", "tailored", "programme"],
  },

  {
    id: "CAP-PROCUREMENT-EXCELLENCE",
    slug: "/education/procurement-excellence",
    name: { pl: "Procurement Excellence", en: "Procurement Excellence" },
    intents: ["I6_EDUCATION", "I5_SOURCING"],
    maturityPersonas: ["strategic_sourcer", "advanced_analyst"],
    description: {
      pl: "Zaawansowany program budowania doskonałości zakupowej — od strategii do egzekucji.",
      en: "Advanced programme for building procurement excellence — from strategy to execution.",
    },
    shortLabel: { pl: "Procurement Excellence", en: "Procurement Excellence" },
    relatedIds: ["CAP-INCO", "CAP-CAT-STRATEGY"],
    advisoryPathNext: ["CAP-CAT-STRATEGY"],
    executiveRelevance: ["CPO", "procurement_director"],
    tags: ["excellence", "advanced", "programme", "strategic"],
  },
];

// ── Capability Edges ──────────────────────────────────────
export const CAPABILITY_EDGES: CapabilityEdge[] = [
  { from: "CAP-SPOT", to: "CAP-SHOULD-COST", weight: 0.9, reason: { pl: "SPOT identyfikuje kategorie dla should-cost", en: "SPOT identifies categories for should-cost" } },
  { from: "CAP-SPOT", to: "CAP-SPEND-CUBE", weight: 0.7, reason: { pl: "SPOT daje podstawę pod pełne spend analytics", en: "SPOT provides foundation for full spend analytics" } },
  { from: "CAP-SHOULD-COST", to: "CAP-NEG-PREP", weight: 0.95, reason: { pl: "Analiza kosztów jest wejściem do playbooku negocjacyjnego", en: "Cost analysis feeds into negotiation playbook" } },
  { from: "CAP-NEG-PREP", to: "CAP-NEG-SUPPORT", weight: 0.8, reason: { pl: "Playbook umożliwia wsparcie live", en: "Playbook enables live negotiation support" } },
  { from: "CAP-BENCH", to: "CAP-NEG-PREP", weight: 0.75, reason: { pl: "Benchmarking wzmacnia pozycję negocjacyjną", en: "Benchmarking strengthens negotiation position" } },
  { from: "CAP-SUPPLIER-INTEL", to: "CAP-BENCH", weight: 0.7, reason: { pl: "Intelligence dostawcy wspiera benchmarking", en: "Supplier intelligence supports benchmarking" } },
  { from: "CAP-SPEND-CUBE", to: "CAP-DASHBOARDS", weight: 0.85, reason: { pl: "Cube jest fundamentem dashboardów", en: "Cube is the dashboard foundation" } },
  { from: "CAP-DASHBOARDS", to: "CAP-KPI", weight: 0.8, reason: { pl: "Dashboardy umożliwiają systematyczne KPI", en: "Dashboards enable systematic KPIs" } },
  { from: "CAP-CAT-STRATEGY", to: "CAP-TRANSFORMATION", weight: 0.85, reason: { pl: "Strategia kategorii prowadzi do transformacji", en: "Category strategy leads to transformation" } },
  { from: "CAP-TRANSFORMATION", to: "CAP-PMO", weight: 0.9, reason: { pl: "Transformacja wymaga PMO do zarządzania", en: "Transformation requires PMO governance" } },
  { from: "CAP-NEG-WORKSHOP", to: "CAP-NEG-PREP", weight: 0.85, reason: { pl: "Workshop daje kompetencje do przygotowania", en: "Workshop builds preparation capabilities" } },
  { from: "CAP-INCO", to: "CAP-PROCUREMENT-EXCELLENCE", weight: 0.7, reason: { pl: "In-company prowadzi do excellence programu", en: "In-company leads to excellence programme" } },
];

// ── Helper: Get node by ID ────────────────────────────────
export function getCapabilityNodeById(id: string): CapabilityNode | null {
  return CAPABILITY_NODES.find((n) => n.id === id) ?? null;
}

// ── Helper: Get node by page slug ─────────────────────────
export function getCapabilityNodeBySlug(slug: string): CapabilityNode | null {
  return CAPABILITY_NODES.find((n) => n.slug === slug) ?? null;
}

// ── Helper: Get related nodes ─────────────────────────────
export function getRelatedCapabilities(nodeId: string): CapabilityNode[] {
  const node = getCapabilityNodeById(nodeId);
  if (!node) return [];
  return node.relatedIds
    .map((id) => getCapabilityNodeById(id))
    .filter((n): n is CapabilityNode => n !== null);
}
