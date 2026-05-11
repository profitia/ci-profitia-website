// ─────────────────────────────────────────────────────────
// CIC — Context Orchestrator
//
// Merges multiple ContextLayers into a single CompositeContextLayer.
// Applies priority ordering, deduplication, conditional filtering
// and renders the final system prompt contribution.
//
// Rules:
//   - Higher priority layer wins on conflicts (same id)
//   - Lower priority rules are still included if non-conflicting
//   - Executive framing: first match wins (highest priority layer)
//   - System prompt contribution: ordered by priority, capped for token budget
// ─────────────────────────────────────────────────────────

import type {
  ContextLayer,
  CompositeContextLayer,
  ContextResolutionRequest,
  ReasoningRule,
  NegotiationHeuristic,
  EscalationRule,
  ExecutiveFramingEntry,
  PsychologyEntry,
  ShouldCostEntry,
  CapabilityGroundingEntry,
} from "./types";
import { resolveContextLayers } from "./loader";
import { conditionMatches } from "./loader";

// ── Rule matching ─────────────────────────────────────────

function ruleMatches(
  condition: ReasoningRule["condition"],
  req: ContextResolutionRequest
): boolean {
  return conditionMatches(condition, req);
}

// ── System prompt renderer ────────────────────────────────
// Converts active cognition artifacts into a system prompt section.
// Token budget: keep compact — advisory runtime has a 4k system prompt cap.

function renderSystemPromptContribution(
  reasoningRules: ReasoningRule[],
  negotiationHeuristics: NegotiationHeuristic[],
  escalationRules: EscalationRule[],
  executiveFraming: ExecutiveFramingEntry | null,
  psychology: PsychologyEntry[],
  shouldCost: ShouldCostEntry[],
  capabilities: CapabilityGroundingEntry[],
  principles: string[],
  locale: "pl" | "en"
): string {
  const sections: string[] = [];

  sections.push("DOMAIN COGNITION CONTEXT (Procurement Advisory Layer v1):");

  if (reasoningRules.length > 0) {
    sections.push("\nADVISORY REASONING:");
    reasoningRules
      .slice(0, 6)
      .forEach((r) => sections.push(`- ${r.systemPromptSnippet[locale]}`));
  }

  if (negotiationHeuristics.length > 0) {
    sections.push("\nNEGOTIATION INTELLIGENCE:");
    negotiationHeuristics
      .slice(0, 4)
      .forEach((h) => sections.push(`- ${h.systemPromptSnippet[locale]}`));
  }

  if (shouldCost.length > 0) {
    sections.push("\nSHOULD-COST LOGIC:");
    shouldCost
      .slice(0, 3)
      .forEach((s) => sections.push(`- ${s.systemPromptSnippet[locale]}`));
  }

  if (escalationRules.length > 0) {
    const top = escalationRules[0];
    sections.push(`\nESCALATION LOGIC:\n- ${top.systemPromptSnippet[locale]}`);
  }

  if (executiveFraming) {
    sections.push(
      `\nEXECUTIVE FRAMING (${executiveFraming.role}):\n- KPIs: ${executiveFraming.kpis.join(", ")}\n- ${executiveFraming.systemPromptSnippet[locale]}`
    );
  }

  if (psychology.length > 0) {
    sections.push("\nPROCUREMENT PSYCHOLOGY:");
    psychology
      .slice(0, 2)
      .forEach((p) => sections.push(`- ${p.systemPromptSnippet[locale]}`));
  }

  if (capabilities.length > 0) {
    sections.push("\nCAPABILITY GROUNDING:");
    capabilities
      .slice(0, 4)
      .forEach((c) => sections.push(`- ${c.systemPromptSnippet[locale]}`));
  }

  if (principles.length > 0) {
    sections.push("\nSTRATEGIC PRINCIPLES:");
    principles.slice(0, 3).forEach((p) => sections.push(`- ${p}`));
  }

  return sections.join("\n");
}

// ── Main orchestrator ─────────────────────────────────────

/**
 * Resolves and merges all eligible ContextLayers for the given request.
 * Returns a CompositeContextLayer ready for injection into the advisory runtime.
 */
export function orchestrateContextLayers(
  req: ContextResolutionRequest
): CompositeContextLayer {
  const layers: ContextLayer[] = resolveContextLayers(req);

  if (layers.length === 0) {
    return {
      sourceLayerIds: [],
      activeReasoningRules: [],
      activeNegotiationHeuristics: [],
      activeEscalationRules: [],
      activeExecutiveFraming: null,
      activePsychologyEntries: [],
      activeShouldCostEntries: [],
      activeCapabilityGrounding: [],
      strategicPrinciples: [],
      systemPromptContribution: "",
      resolvedAt: Date.now(),
      locale: req.locale,
    };
  }

  // Accumulators
  const seenRuleIds = new Set<string>();
  const activeReasoningRules: ReasoningRule[] = [];

  const seenHeuristicIds = new Set<string>();
  const activeNegotiationHeuristics: NegotiationHeuristic[] = [];

  const seenEscalationIds = new Set<string>();
  const activeEscalationRules: EscalationRule[] = [];

  let activeExecutiveFraming: ExecutiveFramingEntry | null = null;

  const seenPsychIds = new Set<string>();
  const activePsychologyEntries: PsychologyEntry[] = [];

  const seenShouldCostIds = new Set<string>();
  const activeShouldCostEntries: ShouldCostEntry[] = [];

  const seenCapabilityIds = new Set<string>();
  const activeCapabilityGrounding: CapabilityGroundingEntry[] = [];

  const strategicPrinciples: string[] = [];

  for (const layer of layers) {
    // ── Advisory reasoning rules ──────────────────────────
    const sortedRules = [...layer.advisoryLogic].sort(
      (a, b) => b.priority - a.priority
    );
    for (const rule of sortedRules) {
      if (seenRuleIds.has(rule.id)) continue;
      if (ruleMatches(rule.condition, req)) {
        seenRuleIds.add(rule.id);
        activeReasoningRules.push(rule);
      }
    }

    // ── Negotiation heuristics ────────────────────────────
    for (const h of layer.negotiationLogic) {
      if (seenHeuristicIds.has(h.id)) continue;
      const intentOk =
        h.applicableIntents.length === 0 ||
        !req.intent ||
        h.applicableIntents.includes(req.intent);
      if (intentOk) {
        seenHeuristicIds.add(h.id);
        activeNegotiationHeuristics.push(h);
      }
    }

    // ── Escalation rules ──────────────────────────────────
    for (const e of layer.escalationLogic) {
      if (seenEscalationIds.has(e.id)) continue;
      if (ruleMatches(e.condition, req)) {
        seenEscalationIds.add(e.id);
        activeEscalationRules.push(e);
      }
    }

    // ── Executive framing — highest-priority layer wins ───
    if (!activeExecutiveFraming) {
      const targetRole = req.executiveRole;
      const framing = layer.executiveFraming.find(
        (f) => f.role === "all" || (targetRole && f.role === targetRole)
      );
      if (framing) activeExecutiveFraming = framing;
    }

    // ── Procurement psychology ────────────────────────────
    for (const p of layer.procurementPsychology) {
      if (!seenPsychIds.has(p.id)) {
        seenPsychIds.add(p.id);
        activePsychologyEntries.push(p);
      }
    }

    // ── Should-cost entries ───────────────────────────────
    for (const s of layer.shouldCostLogic) {
      if (!seenShouldCostIds.has(s.id)) {
        seenShouldCostIds.add(s.id);
        activeShouldCostEntries.push(s);
      }
    }

    // ── Capability grounding — intent-filtered ────────────
    for (const c of layer.capabilityGrounding) {
      if (seenCapabilityIds.has(c.capabilityId)) continue;
      const intentOk =
        c.triggerIntents.length === 0 ||
        !req.intent ||
        c.triggerIntents.includes(req.intent);
      const urgencyOk =
        c.triggerUrgency.length === 0 ||
        !req.urgency ||
        c.triggerUrgency.includes(req.urgency);
      if (intentOk && urgencyOk) {
        seenCapabilityIds.add(c.capabilityId);
        activeCapabilityGrounding.push(c);
      }
    }

    // ── Strategic principles (union, no duplicates) ───────
    for (const principle of layer.strategicPrinciples) {
      if (!strategicPrinciples.includes(principle)) {
        strategicPrinciples.push(principle);
      }
    }
  }

  const systemPromptContribution = renderSystemPromptContribution(
    activeReasoningRules,
    activeNegotiationHeuristics,
    activeEscalationRules,
    activeExecutiveFraming,
    activePsychologyEntries,
    activeShouldCostEntries,
    activeCapabilityGrounding,
    strategicPrinciples,
    req.locale
  );

  return {
    sourceLayerIds: layers.map((l) => l.id),
    activeReasoningRules,
    activeNegotiationHeuristics,
    activeEscalationRules,
    activeExecutiveFraming,
    activePsychologyEntries,
    activeShouldCostEntries,
    activeCapabilityGrounding,
    strategicPrinciples,
    systemPromptContribution,
    resolvedAt: Date.now(),
    locale: req.locale,
  };
}
