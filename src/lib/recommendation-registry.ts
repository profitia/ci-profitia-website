// ─────────────────────────────────────────────────────────
// CI-Profitia — Recommendation Registry
// All recommendable pages with intent/urgency/confidence
// ─────────────────────────────────────────────────────────

import type { RecommendationCard } from "@/types";

export const RECOMMENDATION_REGISTRY: RecommendationCard[] = [
  // ── Negotiation (I8) ─────────────────────────────────
  {
    id: "R-I8-01",
    type: "service",
    title: "Negotiation Preparation",
    description:
      "Build the full negotiation playbook — cost position, supplier profile, argumentation strategy, and team briefing.",
    url: "/services/negotiation-preparation",
    cta: "Explore service",
    intentFit: ["I8_NEGOTIATIONS", "I1_SAVINGS"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGHEST",
    confidenceThreshold: 0.7,
    tags: ["negotiations", "preparation", "playbook"],
  },
  {
    id: "R-I8-02",
    type: "service",
    title: "Should-Cost Analysis",
    description:
      "Understand the true cost structure of what you buy — and know exactly where the negotiation margin is.",
    url: "/services/should-cost-analysis",
    cta: "Explore service",
    intentFit: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I3_SUPPLIER_RISK"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGH",
    confidenceThreshold: 0.65,
    tags: ["cost intelligence", "should-cost", "negotiation leverage"],
  },
  {
    id: "R-I8-03",
    type: "service",
    title: "SPOT Analysis",
    description:
      "Fast diagnostic: 5-10 days from your data to a clear picture of where savings and negotiation leverage are.",
    url: "/services/analiza-spot",
    cta: "Explore service",
    intentFit: ["I8_NEGOTIATIONS", "I1_SAVINGS"],
    urgencyFit: ["U1"],
    priority: "HIGH",
    confidenceThreshold: 0.6,
    tags: ["fast track", "diagnostic", "spot"],
  },
  {
    id: "R-I8-04",
    type: "service",
    title: "Supplier Negotiation Support",
    description:
      "Hands-on support during the negotiation — position coaching, real-time advisory, concession management.",
    url: "/services/supplier-negotiation-support",
    cta: "Explore service",
    intentFit: ["I8_NEGOTIATIONS"],
    urgencyFit: ["U1"],
    priority: "HIGH",
    confidenceThreshold: 0.75,
    tags: ["live support", "negotiation", "concessions"],
  },
  {
    id: "R-I8-05",
    type: "education",
    title: "Procurement Negotiations Workshop",
    description:
      "Harvard-methodology workshop — practical negotiation technique grounded in real case studies.",
    url: "/education/warsztaty-negocjacyjne",
    cta: "Explore programme",
    intentFit: ["I8_NEGOTIATIONS", "I6_EDUCATION"],
    urgencyFit: ["U2", "U3"],
    priority: "MEDIUM",
    confidenceThreshold: 0.6,
    tags: ["workshop", "team", "harvard"],
  },
  // ── Savings (I1) ─────────────────────────────────────
  {
    id: "R-I1-01",
    type: "service",
    title: "Should-Cost Analysis",
    description:
      "Identify the real cost gap between what you pay and what you should pay — across any category.",
    url: "/services/should-cost-analysis",
    cta: "Explore service",
    intentFit: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGHEST",
    confidenceThreshold: 0.7,
    tags: ["savings", "cost model", "benchmarking"],
  },
  {
    id: "R-I1-02",
    type: "service",
    title: "Supplier Benchmarking",
    description:
      "Know what the market pays. Close the gap between your current terms and market rates — with data, not guesswork.",
    url: "/services/supplier-benchmarking",
    cta: "Explore service",
    intentFit: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGH",
    confidenceThreshold: 0.65,
    tags: ["benchmarking", "market rates", "pricing intelligence"],
  },
  {
    id: "R-I1-03",
    type: "service",
    title: "SPOT Analysis",
    description:
      "Start here: fast spend diagnostic to surface the biggest savings opportunities in your top categories.",
    url: "/services/analiza-spot",
    cta: "Explore service",
    intentFit: ["I1_SAVINGS"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGH",
    confidenceThreshold: 0.6,
    tags: ["savings", "quick win", "diagnostic"],
  },
  // ── Forecasting / Analytics (I2) ─────────────────────
  {
    id: "R-I2-01",
    type: "service",
    title: "Spend Cube",
    description:
      "The foundation: understand what you buy, from whom, at what price — across every category and entity.",
    url: "/services/spend-cube",
    cta: "Explore service",
    intentFit: ["I2_FORECASTING", "I1_SAVINGS"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGHEST",
    confidenceThreshold: 0.7,
    tags: ["spend visibility", "analytics", "spend cube"],
  },
  {
    id: "R-I2-02",
    type: "service",
    title: "Spend Analytics",
    description:
      "Turn procurement data into decision intelligence — category trends, supplier concentration, cost drivers.",
    url: "/services/spend-analytics",
    cta: "Explore service",
    intentFit: ["I2_FORECASTING", "I1_SAVINGS"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGH",
    confidenceThreshold: 0.65,
    tags: ["analytics", "intelligence", "reporting"],
  },
  // ── Supplier Risk (I3) ────────────────────────────────
  {
    id: "R-I3-01",
    type: "service",
    title: "Supplier Intelligence",
    description:
      "Financial health, concentration risk, dependency mapping — know where your supply chain is exposed before it costs you.",
    url: "/services/supplier-intelligence",
    cta: "Explore service",
    intentFit: ["I3_SUPPLIER_RISK", "I8_NEGOTIATIONS", "I2_FORECASTING"],
    urgencyFit: ["U1", "U2"],
    priority: "HIGHEST",
    confidenceThreshold: 0.7,
    tags: ["supplier risk", "financial health", "concentration"],
  },
  // ── Sourcing / Transformation (I5) ───────────────────
  {
    id: "R-I5-01",
    type: "service",
    title: "Advisory Projects",
    description:
      "End-to-end advisory engagement — from situation diagnosis to concrete recommendations, implemented with your team.",
    url: "/services/projekty-doradcze",
    cta: "Explore service",
    intentFit: ["I5_SOURCING", "I1_SAVINGS"],
    urgencyFit: ["U2", "U3"],
    priority: "HIGHEST",
    confidenceThreshold: 0.65,
    tags: ["advisory", "consulting", "transformation"],
  },
  {
    id: "R-I5-02",
    type: "service",
    title: "Procurement Transformation",
    description:
      "Systemic change: build a procurement function that drives margin, not just processes invoices.",
    url: "/services/procurement-transformation",
    cta: "Explore service",
    intentFit: ["I5_SOURCING", "I4_DIGITALIZATION"],
    urgencyFit: ["U2", "U3"],
    priority: "HIGH",
    confidenceThreshold: 0.7,
    tags: ["transformation", "operating model", "C-suite"],
  },
  // ── Education (I6) ───────────────────────────────────
  {
    id: "R-I6-01",
    type: "education",
    title: "Procurement Academy",
    description:
      "Executive programme for procurement directors — strategy, transformation, decision-making under pressure.",
    url: "/education/akademia-zakupow",
    cta: "Explore programme",
    intentFit: ["I6_EDUCATION", "I5_SOURCING"],
    urgencyFit: ["U2", "U3"],
    priority: "HIGHEST",
    confidenceThreshold: 0.65,
    tags: ["executive", "programme", "academy"],
  },
  {
    id: "R-I6-02",
    type: "education",
    title: "In-Company Workshops",
    description:
      "Custom programme designed for your team's specific challenges — any topic, any format, delivered on-site.",
    url: "/education/in-company-workshops",
    cta: "Explore programme",
    intentFit: ["I6_EDUCATION"],
    urgencyFit: ["U1", "U2", "U3"],
    priority: "HIGH",
    confidenceThreshold: 0.6,
    tags: ["custom", "in-house", "team training"],
  },
];

export function getRecommendationsForIntent(
  intentCode: string,
  urgency: string,
  confidence: number,
  excludeIds: string[] = []
): RecommendationCard[] {
  return RECOMMENDATION_REGISTRY.filter(
    (r) =>
      r.intentFit.includes(intentCode as any) &&
      r.urgencyFit.includes(urgency as any) &&
      r.confidenceThreshold <= confidence &&
      !excludeIds.includes(r.id)
  ).sort((a, b) => {
    const priorityOrder = { HIGHEST: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
