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
  SupplierTacticPattern,
  LeverageVector,
  BATNAIntelligenceEntry,
  ConcessionPattern,
  PriceManipulationPattern,
  PowerDynamicsEntry,
  NegotiationSequenceRule,
  NegotiationDiagnostic,
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
  supplierTactics: SupplierTacticPattern[],
  leverageVectors: LeverageVector[],
  baTNAIntelligence: BATNAIntelligenceEntry[],
  concessionPatterns: ConcessionPattern[],
  priceManipulation: PriceManipulationPattern[],
  powerDynamics: PowerDynamicsEntry[],
  negotiationSequencing: NegotiationSequenceRule[],
  negotiationDiagnostics: NegotiationDiagnostic[],
  locale: "pl" | "en"
): string {
  const sections: string[] = [];

  sections.push("DOMAIN COGNITION CONTEXT (Procurement & Negotiation Intelligence v1):");

  if (reasoningRules.length > 0) {
    sections.push("\nADVISORY REASONING:");
    reasoningRules
      .slice(0, 6)
      .forEach((r) => sections.push(`- ${r.systemPromptSnippet[locale]}`));
  }

  if (negotiationHeuristics.length > 0) {
    sections.push("\nNEGOTIATION INTELLIGENCE:");
    negotiationHeuristics
      .slice(0, 5)
      .forEach((h) => sections.push(`- ${h.systemPromptSnippet[locale]}`));
  }

  if (supplierTactics.length > 0) {
    sections.push("\nSUPPLIER TACTICS TO RECOGNIZE:");
    supplierTactics
      .slice(0, 4)
      .forEach((t) => sections.push(`- ${t.systemPromptSnippet[locale]}`));
  }

  if (leverageVectors.length > 0) {
    sections.push("\nLEVERAGE INTELLIGENCE:");
    leverageVectors
      .slice(0, 3)
      .forEach((l) => sections.push(`- ${l.systemPromptSnippet[locale]}`));
  }

  if (baTNAIntelligence.length > 0) {
    sections.push("\nBATNA REASONING:");
    baTNAIntelligence
      .slice(0, 2)
      .forEach((b) => sections.push(`- ${b.systemPromptSnippet[locale]}`));
  }

  if (concessionPatterns.length > 0) {
    sections.push("\nCONCESSION LOGIC:");
    concessionPatterns
      .slice(0, 2)
      .forEach((c) => sections.push(`- ${c.systemPromptSnippet[locale]}`));
  }

  if (priceManipulation.length > 0) {
    sections.push("\nPRICE MANIPULATION DETECTION:");
    priceManipulation
      .slice(0, 3)
      .forEach((p) => sections.push(`- ${p.systemPromptSnippet[locale]}`));
  }

  if (powerDynamics.length > 0) {
    sections.push("\nPOWER DYNAMICS:");
    powerDynamics
      .slice(0, 2)
      .forEach((p) => sections.push(`- ${p.systemPromptSnippet[locale]}`));
  }

  if (negotiationSequencing.length > 0) {
    const currentStage = negotiationSequencing[0];
    sections.push(`\nNEGOTIATION STAGE:\n- ${currentStage.systemPromptSnippet[locale]}`);
  }

  if (negotiationDiagnostics.length > 0) {
    sections.push("\nDIAGNOSTIC QUESTIONS (max 2 per interaction):");
    const diag = negotiationDiagnostics[0];
    sections.push(`- Primary: ${diag.questions.primary[locale]}`);
    if (diag.questions.secondary) {
      sections.push(`- Secondary (if needed): ${diag.questions.secondary[locale]}`);
    }
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
    principles.slice(0, 4).forEach((p) => sections.push(`- ${p}`));
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
      activeSupplierTactics: [],
      activeLeverageVectors: [],
      activeBATNAIntelligence: [],
      activeConcessionPatterns: [],
      activePriceManipulationPatterns: [],
      activePowerDynamics: [],
      activeNegotiationSequencing: [],
      activeNegotiationDiagnostics: [],
      systemPromptContribution: "",
      resolvedAt: Date.now(),
      locale: req.locale,
    };
  }

  // Accumulators — ETAP 6
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

  // Accumulators — ETAP 7
  const seenTacticIds = new Set<string>();
  const activeSupplierTactics: SupplierTacticPattern[] = [];

  const seenLeverageIds = new Set<string>();
  const activeLeverageVectors: LeverageVector[] = [];

  const seenBATNAIds = new Set<string>();
  const activeBATNAIntelligence: BATNAIntelligenceEntry[] = [];

  const seenConcessionIds = new Set<string>();
  const activeConcessionPatterns: ConcessionPattern[] = [];

  const seenPriceManipIds = new Set<string>();
  const activePriceManipulationPatterns: PriceManipulationPattern[] = [];

  const seenPowerIds = new Set<string>();
  const activePowerDynamics: PowerDynamicsEntry[] = [];

  const seenSeqIds = new Set<string>();
  const activeNegotiationSequencing: NegotiationSequenceRule[] = [];

  const seenDiagIds = new Set<string>();
  const activeNegotiationDiagnostics: NegotiationDiagnostic[] = [];

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

    // ── ETAP 7: Supplier tactics ──────────────────────────
    const sortedTactics = [...layer.supplierTactics].sort(
      (a, b) => b.priority - a.priority
    );
    for (const t of sortedTactics) {
      if (!seenTacticIds.has(t.id)) {
        seenTacticIds.add(t.id);
        activeSupplierTactics.push(t);
      }
    }

    // ── ETAP 7: Leverage vectors — condition-filtered ─────
    for (const l of layer.leverageVectors) {
      if (seenLeverageIds.has(l.id)) continue;
      if (ruleMatches(l.activationCondition, req)) {
        seenLeverageIds.add(l.id);
        activeLeverageVectors.push(l);
      }
    }

    // ── ETAP 7: BATNA intelligence ────────────────────────
    for (const b of layer.bATNAIntelligence) {
      if (!seenBATNAIds.has(b.id)) {
        seenBATNAIds.add(b.id);
        activeBATNAIntelligence.push(b);
      }
    }

    // ── ETAP 7: Concession patterns ───────────────────────
    for (const c of layer.concessionPatterns) {
      if (!seenConcessionIds.has(c.id)) {
        seenConcessionIds.add(c.id);
        activeConcessionPatterns.push(c);
      }
    }

    // ── ETAP 7: Price manipulation patterns ───────────────
    for (const p of layer.priceManipulationPatterns) {
      if (!seenPriceManipIds.has(p.id)) {
        seenPriceManipIds.add(p.id);
        activePriceManipulationPatterns.push(p);
      }
    }

    // ── ETAP 7: Power dynamics ────────────────────────────
    for (const p of layer.powerDynamics) {
      if (!seenPowerIds.has(p.id)) {
        seenPowerIds.add(p.id);
        activePowerDynamics.push(p);
      }
    }

    // ── ETAP 7: Negotiation sequencing — condition-filtered
    for (const s of layer.negotiationSequencing) {
      if (seenSeqIds.has(s.id)) continue;
      if (ruleMatches(s.condition, req)) {
        seenSeqIds.add(s.id);
        activeNegotiationSequencing.push(s);
      }
    }

    // ── ETAP 7: Negotiation diagnostics — intent-filtered ─
    for (const d of layer.negotiationDiagnostics) {
      if (seenDiagIds.has(d.id)) continue;
      const intentOk =
        d.triggerIntents.length === 0 ||
        !req.intent ||
        d.triggerIntents.includes(req.intent);
      if (intentOk) {
        seenDiagIds.add(d.id);
        activeNegotiationDiagnostics.push(d);
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
    activeSupplierTactics,
    activeLeverageVectors,
    activeBATNAIntelligence,
    activeConcessionPatterns,
    activePriceManipulationPatterns,
    activePowerDynamics,
    activeNegotiationSequencing,
    activeNegotiationDiagnostics,
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
    activeSupplierTactics,
    activeLeverageVectors,
    activeBATNAIntelligence,
    activeConcessionPatterns,
    activePriceManipulationPatterns,
    activePowerDynamics,
    activeNegotiationSequencing,
    activeNegotiationDiagnostics,
    systemPromptContribution,
    resolvedAt: Date.now(),
    locale: req.locale,
  };
}
