// ─────────────────────────────────────────────────────────
// CI-Profitia — Website Page Graph
// Maps every page to its intent, conversion tier, and behavior
// ─────────────────────────────────────────────────────────

import type { PageContext, PageSlug } from "@/types";

export const PAGE_GRAPH: Record<string, PageContext> = {
  "/": {
    slug: "/",
    primaryIntent: "I7_EXPLORATORY",
    secondaryIntents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I5_SOURCING"],
    conversionTier: 4,
    escalationReadiness: "low",
  },
  "/services": {
    slug: "/services",
    primaryIntent: "I7_EXPLORATORY",
    secondaryIntents: ["I1_SAVINGS", "I5_SOURCING", "I8_NEGOTIATIONS"],
    conversionTier: 4,
    escalationReadiness: "low",
  },
  "/education": {
    slug: "/education",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I8_NEGOTIATIONS", "I5_SOURCING"],
    conversionTier: 4,
    escalationReadiness: "low",
  },
  "/blog": {
    slug: "/blog",
    primaryIntent: "I7_EXPLORATORY",
    secondaryIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I3_SUPPLIER_RISK"],
    conversionTier: 5,
    escalationReadiness: "low",
  },
  "/about": {
    slug: "/about",
    primaryIntent: "I7_EXPLORATORY",
    secondaryIntents: [],
    conversionTier: 4,
    escalationReadiness: "low",
  },
  "/contact": {
    slug: "/contact",
    primaryIntent: "I7_EXPLORATORY",
    secondaryIntents: [],
    conversionTier: 1,
    escalationReadiness: "high",
  },
  // Advisory & Transformation
  "/services/projekty-doradcze": {
    slug: "/services/projekty-doradcze",
    primaryIntent: "I5_SOURCING",
    secondaryIntents: ["I1_SAVINGS"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/interim-management": {
    slug: "/services/interim-management",
    primaryIntent: "I5_SOURCING",
    secondaryIntents: [],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/services/procurement-transformation": {
    slug: "/services/procurement-transformation",
    primaryIntent: "I5_SOURCING",
    secondaryIntents: ["I4_DIGITALIZATION", "I1_SAVINGS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/services/category-strategy": {
    slug: "/services/category-strategy",
    primaryIntent: "I1_SAVINGS",
    secondaryIntents: ["I5_SOURCING", "I8_NEGOTIATIONS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/services/operating-model-design": {
    slug: "/services/operating-model-design",
    primaryIntent: "I5_SOURCING",
    secondaryIntents: [],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/procurement-pmo": {
    slug: "/services/procurement-pmo",
    primaryIntent: "I5_SOURCING",
    secondaryIntents: [],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  // Negotiation & Cost Intelligence
  "/services/analiza-spot": {
    slug: "/services/analiza-spot",
    primaryIntent: "I1_SAVINGS",
    secondaryIntents: ["I8_NEGOTIATIONS"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/should-cost-analysis": {
    slug: "/services/should-cost-analysis",
    primaryIntent: "I8_NEGOTIATIONS",
    secondaryIntents: ["I1_SAVINGS", "I3_SUPPLIER_RISK"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/negotiation-preparation": {
    slug: "/services/negotiation-preparation",
    primaryIntent: "I8_NEGOTIATIONS",
    secondaryIntents: ["I1_SAVINGS"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/supplier-benchmarking": {
    slug: "/services/supplier-benchmarking",
    primaryIntent: "I1_SAVINGS",
    secondaryIntents: ["I8_NEGOTIATIONS", "I3_SUPPLIER_RISK"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/supplier-negotiation-support": {
    slug: "/services/supplier-negotiation-support",
    primaryIntent: "I8_NEGOTIATIONS",
    secondaryIntents: [],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  // Data & Analytics
  "/services/spend-cube": {
    slug: "/services/spend-cube",
    primaryIntent: "I2_FORECASTING",
    secondaryIntents: ["I1_SAVINGS", "I4_DIGITALIZATION"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/spend-analytics": {
    slug: "/services/spend-analytics",
    primaryIntent: "I2_FORECASTING",
    secondaryIntents: ["I1_SAVINGS"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/procurement-dashboards": {
    slug: "/services/procurement-dashboards",
    primaryIntent: "I2_FORECASTING",
    secondaryIntents: ["I4_DIGITALIZATION"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/services/supplier-intelligence": {
    slug: "/services/supplier-intelligence",
    primaryIntent: "I3_SUPPLIER_RISK",
    secondaryIntents: ["I8_NEGOTIATIONS", "I2_FORECASTING"],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/services/procurement-kpi-systems": {
    slug: "/services/procurement-kpi-systems",
    primaryIntent: "I2_FORECASTING",
    secondaryIntents: ["I5_SOURCING"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/services/coaching-zakupowy": {
    slug: "/services/coaching-zakupowy",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I8_NEGOTIATIONS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  // Education pages
  "/education/akademia-zakupow": {
    slug: "/education/akademia-zakupow",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I1_SAVINGS", "I5_SOURCING"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/procurement-excellence": {
    slug: "/education/procurement-excellence",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I5_SOURCING"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/strategic-sourcing": {
    slug: "/education/strategic-sourcing",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I5_SOURCING", "I1_SAVINGS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/warsztaty-negocjacyjne": {
    slug: "/education/warsztaty-negocjacyjne",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I8_NEGOTIATIONS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/advanced-negotiations": {
    slug: "/education/advanced-negotiations",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I8_NEGOTIATIONS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/fact-based-negotiation": {
    slug: "/education/fact-based-negotiation",
    primaryIntent: "I8_NEGOTIATIONS",
    secondaryIntents: ["I6_EDUCATION", "I1_SAVINGS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/in-company-workshops": {
    slug: "/education/in-company-workshops",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: [],
    conversionTier: 2,
    escalationReadiness: "high",
  },
  "/education/spend-analytics-training": {
    slug: "/education/spend-analytics-training",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I2_FORECASTING"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/supplier-financial-analysis": {
    slug: "/education/supplier-financial-analysis",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I3_SUPPLIER_RISK"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
  "/education/procurement-mentoring": {
    slug: "/education/procurement-mentoring",
    primaryIntent: "I6_EDUCATION",
    secondaryIntents: ["I5_SOURCING", "I8_NEGOTIATIONS"],
    conversionTier: 3,
    escalationReadiness: "medium",
  },
};

export function getPageContext(slug: string): PageContext {
  return (
    PAGE_GRAPH[slug] ?? {
      slug: slug as PageSlug,
      primaryIntent: "I7_EXPLORATORY",
      secondaryIntents: [],
      conversionTier: 4,
      escalationReadiness: "low",
    }
  );
}
