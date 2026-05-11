// ─────────────────────────────────────────────────────────
// CI-Profitia — Adaptive Page Engine
// Computes section ordering and visibility based on session.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdaptivePageConfig,
  AdvisoryDecision,
  AdvisorySession,
  ExecutiveRole,
  MaturityPersona,
  PageSection,
} from "@/types";

// ── Default section order (baseline) ─────────────────────
const DEFAULT_SECTION_ORDER: PageSection[] = [
  "hero",
  "services_overview",
  "capability_block",
  "proof_point",
  "benchmark",
  "case_study",
  "workshop",
  "roi_block",
  "cta_section",
  "testimonial",
  "about",
  "footer_cta",
];

// ── Section ordering per maturity persona ─────────────────
const PERSONA_SECTION_ORDER: Record<MaturityPersona, PageSection[]> = {
  reactive_buyer: [
    "hero",
    "capability_block",
    "proof_point",
    "case_study",
    "workshop",
    "cta_section",
    "services_overview",
    "benchmark",
    "roi_block",
    "testimonial",
    "about",
    "footer_cta",
  ],
  operational_buyer: [
    "hero",
    "capability_block",
    "benchmark",
    "proof_point",
    "services_overview",
    "workshop",
    "case_study",
    "roi_block",
    "cta_section",
    "testimonial",
    "about",
    "footer_cta",
  ],
  strategic_sourcer: [
    "hero",
    "capability_block",
    "benchmark",
    "services_overview",
    "case_study",
    "roi_block",
    "proof_point",
    "workshop",
    "cta_section",
    "testimonial",
    "about",
    "footer_cta",
  ],
  advanced_analyst: [
    "hero",
    "benchmark",
    "capability_block",
    "services_overview",
    "roi_block",
    "case_study",
    "proof_point",
    "workshop",
    "cta_section",
    "testimonial",
    "about",
    "footer_cta",
  ],
  executive_stakeholder: [
    "hero",
    "roi_block",
    "proof_point",
    "benchmark",
    "capability_block",
    "case_study",
    "cta_section",
    "services_overview",
    "testimonial",
    "about",
    "footer_cta",
    "workshop",
  ],
  transformation_leader: [
    "hero",
    "capability_block",
    "roi_block",
    "benchmark",
    "case_study",
    "services_overview",
    "cta_section",
    "proof_point",
    "workshop",
    "testimonial",
    "about",
    "footer_cta",
  ],
  unknown: DEFAULT_SECTION_ORDER,
};

// ── Section highlighting per intent ───────────────────────
const INTENT_HIGHLIGHTED_SECTIONS: Record<string, PageSection[]> = {
  I1_SAVINGS: ["capability_block", "benchmark", "roi_block"],
  I8_NEGOTIATIONS: ["capability_block", "workshop", "proof_point"],
  I3_SUPPLIER_RISK: ["capability_block", "proof_point", "case_study"],
  I5_SOURCING: ["capability_block", "services_overview", "roi_block"],
  I2_FORECASTING: ["capability_block", "benchmark", "roi_block"],
  I6_EDUCATION: ["workshop", "capability_block", "testimonial"],
  I4_DIGITALIZATION: ["capability_block", "services_overview", "roi_block"],
  I7_EXPLORATORY: ["capability_block", "services_overview", "proof_point"],
  UNKNOWN: ["hero", "capability_block", "cta_section"],
};

// ── Detect executive role ─────────────────────────────────
function getExecRole(persona: MaturityPersona): ExecutiveRole {
  if (persona === "executive_stakeholder") return "CFO";
  if (persona === "transformation_leader") return "CPO";
  if (persona === "advanced_analyst") return "procurement_director";
  if (persona === "strategic_sourcer") return "category_manager";
  return "general";
}

// ── Compute adaptive page config ──────────────────────────
export function computeAdaptivePageConfig(
  session: AdvisorySession,
  decision: AdvisoryDecision
): AdaptivePageConfig {
  const persona = decision.maturity.persona;
  const primaryIntent = decision.intent.primary;
  const isExecutive =
    persona === "executive_stakeholder" || persona === "transformation_leader";

  // Section ordering based on persona
  const sectionOrder = PERSONA_SECTION_ORDER[persona] ?? DEFAULT_SECTION_ORDER;

  // All sections visible by default (page decides actual render)
  const visibleSections: PageSection[] = [...sectionOrder];

  // Highlight sections matching current intent
  const highlightedSections: PageSection[] =
    INTENT_HIGHLIGHTED_SECTIONS[primaryIntent] ?? [];

  return {
    sectionOrder,
    visibleSections,
    highlightedSections,
    executiveMode: isExecutive,
    persona,
    executiveRole: getExecRole(persona),
  };
}
