// ─────────────────────────────────────────────────────────
// CI-Profitia — CTA Registry & Orchestration
// ─────────────────────────────────────────────────────────

import type { CTAItem, IntentCode, UrgencyLevel } from "@/types";

export const CTA_REGISTRY: CTAItem[] = [
  {
    id: "CTA-01-contact",
    type: "contact_form",
    label: "Schedule a conversation",
    url: "/contact",
    urgencyFit: ["U1", "U2", "U3"],
    intentFit: [
      "I1_SAVINGS", "I2_FORECASTING", "I3_SUPPLIER_RISK",
      "I4_DIGITALIZATION", "I5_SOURCING", "I6_EDUCATION",
      "I7_EXPLORATORY", "I8_NEGOTIATIONS",
    ],
    buyingStageMin: "S2",
    strength: 9,
    friction: "low",
  },
  {
    id: "CTA-02-spot",
    type: "spot_analysis",
    label: "Start with a SPOT Analysis",
    url: "/services/analiza-spot",
    urgencyFit: ["U1"],
    intentFit: ["I1_SAVINGS", "I8_NEGOTIATIONS"],
    buyingStageMin: "S3",
    strength: 8,
    friction: "low",
  },
  {
    id: "CTA-03-workshop",
    type: "workshop",
    label: "Ask about a workshop",
    url: "/education/warsztaty-negocjacyjne",
    urgencyFit: ["U2", "U3"],
    intentFit: ["I6_EDUCATION", "I8_NEGOTIATIONS"],
    buyingStageMin: "S2",
    strength: 6,
    friction: "low",
  },
  {
    id: "CTA-04-in-company",
    type: "workshop",
    label: "Design an in-company programme",
    url: "/education/in-company-workshops",
    urgencyFit: ["U1", "U2", "U3"],
    intentFit: ["I6_EDUCATION"],
    buyingStageMin: "S3",
    strength: 7,
    friction: "medium",
  },
  {
    id: "CTA-05-phone",
    type: "phone",
    label: "Call us directly",
    url: "tel:+48533747340",
    urgencyFit: ["U1"],
    intentFit: [
      "I1_SAVINGS", "I8_NEGOTIATIONS", "I3_SUPPLIER_RISK",
    ],
    buyingStageMin: "S4",
    strength: 10,
    friction: "low",
  },
  {
    id: "CTA-06-email",
    type: "email",
    label: "Send a message",
    url: "mailto:kontakt@profitia.pl",
    urgencyFit: ["U1", "U2"],
    intentFit: [
      "I1_SAVINGS", "I2_FORECASTING", "I3_SUPPLIER_RISK",
      "I5_SOURCING", "I8_NEGOTIATIONS",
    ],
    buyingStageMin: "S2",
    strength: 7,
    friction: "low",
  },
  {
    id: "CTA-07-spend-cube",
    type: "service_order",
    label: "Order a Spend Cube",
    url: "/services/spend-cube",
    urgencyFit: ["U1", "U2"],
    intentFit: ["I2_FORECASTING", "I1_SAVINGS"],
    buyingStageMin: "S4",
    strength: 9,
    friction: "medium",
  },
];

// Escalation hierarchy by urgency
export const ESCALATION_HIERARCHY: Record<UrgencyLevel, CTAItem["type"][]> = {
  U1: ["contact_form", "phone", "spot_analysis"],
  U2: ["contact_form", "spot_analysis", "workshop"],
  U3: ["contact_form", "workshop", "email"],
};

export function getPrioritizedCTAs(
  intent: IntentCode,
  urgency: UrgencyLevel,
  shownCTAIds: string[] = [],
  limit = 2
): CTAItem[] {
  const hierarchy = ESCALATION_HIERARCHY[urgency];

  return CTA_REGISTRY.filter(
    (cta) =>
      cta.intentFit.includes(intent) &&
      cta.urgencyFit.includes(urgency) &&
      !shownCTAIds.includes(cta.id)
  )
    .sort((a, b) => {
      const aOrder = hierarchy.indexOf(a.type);
      const bOrder = hierarchy.indexOf(b.type);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.strength - a.strength;
    })
    .slice(0, limit);
}
