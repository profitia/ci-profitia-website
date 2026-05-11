// ─────────────────────────────────────────────────────────
// CI-Profitia — Widget Orchestrator
// Scores, ranks and selects contextual widgets per session.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryDecision,
  AdvisorySession,
  ContextualWidget,
  ExecutiveRole,
  Locale,
  MaturityPersona,
  WidgetDecision,
  WidgetType,
} from "@/types";
import { WIDGET_REGISTRY } from "./widget-registry";

// ── Scoring weights ───────────────────────────────────────
const W = {
  intentPrimary: 35,
  intentSecondary: 15,
  maturityMatch: 25,
  executiveBonus: 15,
  urgencyBonus: 10,
  priorityBonus: 5,
  fatiguepenalty: -20,
} as const;

// ── Executive role detection from maturity persona ────────
function getExecutiveRole(persona: MaturityPersona): ExecutiveRole | null {
  if (persona === "executive_stakeholder") return "CFO";
  if (persona === "transformation_leader") return "CPO";
  return null;
}

// ── Widget type priority per context ─────────────────────
const WIDGET_TYPE_PRIORITY: Record<WidgetType, number> = {
  executive_summary: 10,
  roi_insight: 9,
  benchmark_insight: 8,
  supplier_risk_insight: 8,
  workshop_recommendation: 7,
  transformation_prompt: 7,
  recommendation: 6,
  advisory_insight: 6,
  capability_teaser: 5,
  proof_point: 5,
  diagnostic: 4,
};

// ── Score a widget ────────────────────────────────────────
function scoreWidget(
  widget: ContextualWidget,
  decision: AdvisoryDecision,
  locale: Locale,
  shownIds: Set<string>
): number {
  if (widget.locale !== locale) return -1;
  if (shownIds.has(widget.id)) return -1;

  let score = 0;

  // Intent scoring
  const primary = decision.intent.primary;
  const secondary = decision.intent.secondary;
  const primaryConf = decision.intent.primaryConfidence;
  const secondaryConf = decision.intent.secondaryConfidence;

  if (widget.intents.includes(primary)) {
    score += W.intentPrimary * primaryConf;
  } else if (secondary && widget.intents.includes(secondary)) {
    score += W.intentSecondary * secondaryConf;
  }

  // Maturity match
  const persona = decision.maturity.persona;
  if (widget.maturityPersonas.includes(persona)) {
    score += W.maturityMatch;
  } else if (persona === "unknown") {
    score += W.maturityMatch * 0.4;
  }

  // Executive bonus
  const execRole = getExecutiveRole(persona);
  if (execRole && widget.executiveRoles?.includes(execRole)) {
    score += W.executiveBonus;
  }

  // Urgency bonus — boost high-intent widgets for urgent signals
  if (decision.intent.urgency === "U1" && widget.priority >= 8) {
    score += W.urgencyBonus;
  }

  // Widget type priority (normalized)
  const typePriority = WIDGET_TYPE_PRIORITY[widget.type] ?? 5;
  score += (typePriority / 10) * W.priorityBonus;

  // Registry priority bonus
  score += (widget.priority / 10) * 4;

  // Fatigue penalty if engagement is low but many widgets already shown
  if (decision.fatigue.level === "high") {
    score += W.fatiguepenalty;
  }

  return score;
}

// ── Compute widget decision ───────────────────────────────
export function computeWidgetDecision(
  session: AdvisorySession,
  decision: AdvisoryDecision
): WidgetDecision {
  const locale = session.locale;
  const shownIds = new Set(session.intelligence.recommendationsShown);

  const scored = WIDGET_REGISTRY
    .map((widget) => ({ widget, score: scoreWidget(widget, decision, locale, shownIds) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { widgets: [], primaryWidget: null, rationale: "no_matching_widgets" };
  }

  // Deduplicate by widget type — max 1 of each type in top results
  const usedTypes = new Set<WidgetType>();
  const selected: ContextualWidget[] = [];

  for (const { widget } of scored) {
    if (!usedTypes.has(widget.type) && selected.length < 4) {
      usedTypes.add(widget.type);
      selected.push(widget);
    }
  }

  const primaryWidget = selected[0] ?? null;
  const rationale = buildWidgetRationale(decision, primaryWidget);

  return { widgets: selected, primaryWidget, rationale };
}

// ── Build human-readable rationale ───────────────────────
function buildWidgetRationale(
  decision: AdvisoryDecision,
  primary: ContextualWidget | null
): string {
  if (!primary) return "no_widget_selected";
  return `${primary.type}:${primary.id} — intent=${decision.intent.primary}(${Math.round(decision.intent.primaryConfidence * 100)}%) persona=${decision.maturity.persona}`;
}

// ── Get a single widget by type for specific placement ────
export function getWidgetByType(
  type: WidgetType,
  decision: AdvisoryDecision,
  locale: Locale
): ContextualWidget | null {
  const candidates = WIDGET_REGISTRY
    .filter((w) => w.type === type && w.locale === locale)
    .map((widget) => ({ widget, score: scoreWidget(widget, decision, locale, new Set()) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.widget ?? null;
}
