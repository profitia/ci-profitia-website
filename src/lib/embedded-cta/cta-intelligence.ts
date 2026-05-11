// ─────────────────────────────────────────────────────────
// CI-Profitia — CTA Intelligence Engine
// Scores adaptive CTAs and builds CTADecision per session.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdaptiveCTAConfig,
  AdvisoryDecision,
  AdvisorySession,
  CTADecision,
  ExecutiveRole,
  MaturityPersona,
} from "@/types";
import { ADAPTIVE_CTA_REGISTRY } from "./adaptive-cta-registry";

// ── Executive role detection ──────────────────────────────
function detectExecRole(persona: MaturityPersona): ExecutiveRole {
  if (persona === "executive_stakeholder") return "CFO";
  if (persona === "transformation_leader") return "CPO";
  return "general";
}

// ── Score a single CTA ────────────────────────────────────
function scoreCTA(
  cta: AdaptiveCTAConfig,
  decision: AdvisoryDecision,
  shownIds: Set<string>
): number {
  // Soft filter on already-shown (allow re-show for primary)
  const alreadyShown = shownIds.has(cta.id);

  let score = 0;

  // Urgency fit
  if (cta.urgencyFit.includes(decision.intent.urgency)) {
    score += 25;
    if (decision.intent.urgency === "U1") score += 15; // urgency amplifier
  } else {
    return alreadyShown ? -1 : 0; // hard miss on urgency
  }

  // Intent fit
  const primary = decision.intent.primary;
  const secondary = decision.intent.secondary;
  if (cta.intents.includes(primary)) {
    score += 30 * decision.intent.primaryConfidence;
  } else if (secondary && cta.intents.includes(secondary)) {
    score += 15 * decision.intent.secondaryConfidence;
  }

  // Maturity persona fit
  const persona = decision.maturity.persona;
  if (cta.maturityPersonas.includes(persona)) {
    score += 20;
  } else if (persona === "unknown") {
    score += 8;
  }

  // Executive role fit
  const execRole = detectExecRole(persona);
  if (cta.executiveRoles?.includes(execRole)) {
    score += 15;
  }

  // Strength bonus (normalized)
  score += (cta.strength / 10) * 10;

  // Fatigue penalty
  if (alreadyShown) score -= 15;
  if (decision.fatigue.level === "high") score -= 20;
  if (decision.fatigue.shouldPauseCTAs) score -= 30;

  return score;
}

// ── Compute CTA decision ──────────────────────────────────
export function computeCTADecision(
  session: AdvisorySession,
  decision: AdvisoryDecision
): CTADecision {
  const shownIds = new Set(session.intelligence.ctasShown);

  const scored = ADAPTIVE_CTA_REGISTRY
    .map((cta) => ({ cta, score: scoreCTA(cta, decision, shownIds) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback: default CTA if no match
  const fallback: AdaptiveCTAConfig = ADAPTIVE_CTA_REGISTRY.find(
    (c) => c.id === "ACTA-01"
  )!;

  const primary = scored[0]?.cta ?? fallback;

  // Secondary: different type than primary, not already used as primary
  const secondary =
    scored.find(
      (s) => s.cta.id !== primary.id && s.cta.type !== primary.type
    )?.cta ?? null;

  const rationale = buildCTARationale(decision, primary);

  return { primary, secondary, rationale };
}

// ── Build rationale string ────────────────────────────────
function buildCTARationale(
  decision: AdvisoryDecision,
  primary: AdaptiveCTAConfig
): string {
  return `${primary.id}:${primary.type} — urgency=${decision.intent.urgency} intent=${decision.intent.primary} persona=${decision.maturity.persona}`;
}
