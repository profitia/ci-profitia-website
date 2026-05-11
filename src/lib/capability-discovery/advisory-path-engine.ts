// ─────────────────────────────────────────────────────────
// CI-Profitia — Advisory Path Engine
// Computes next-best-capability recommendations and
// advisory discovery paths per session context.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryDecision,
  AdvisorySession,
  CapabilityDiscoveryDecision,
  CapabilityNode,
} from "@/types";
import {
  CAPABILITY_NODES,
  getCapabilityNodeBySlug,
  getRelatedCapabilities,
} from "./capability-graph";

// ── Score a capability node against session context ───────
function scoreCapabilityNode(
  node: CapabilityNode,
  decision: AdvisoryDecision,
  visitedSlugs: Set<string>
): number {
  let score = 0;

  const primary = decision.intent.primary;
  const secondary = decision.intent.secondary;
  const persona = decision.maturity.persona;

  // Intent match
  if (node.intents.includes(primary)) {
    score += 40 * decision.intent.primaryConfidence;
  } else if (secondary && node.intents.includes(secondary)) {
    score += 20 * decision.intent.secondaryConfidence;
  }

  // Maturity match
  if (node.maturityPersonas.includes(persona)) {
    score += 25;
  } else if (persona === "unknown") {
    score += 10;
  }

  // Executive relevance bonus
  if (
    (persona === "executive_stakeholder" &&
      node.executiveRelevance.some((r) => ["CFO", "CEO", "CPO"].includes(r))) ||
    (persona === "transformation_leader" && node.executiveRelevance.includes("CPO"))
  ) {
    score += 15;
  }

  // Already-visited penalty (light — still show for deep context)
  if (visitedSlugs.has(node.slug)) {
    score -= 20;
  }

  // Escalation readiness bonus
  if (decision.sessionHealth.escalationLikelihood > 0.6 && node.tags.includes("diagnostic")) {
    score += 10;
  }

  return score;
}

// ── Compute capability discovery decision ─────────────────
export function computeCapabilityDiscovery(
  session: AdvisorySession,
  decision: AdvisoryDecision
): CapabilityDiscoveryDecision {
  const visitedSlugs = new Set(session.intelligence.pagesVisited);
  const currentSlug = session.pageContext.slug;

  // Current capability (if on a capability page)
  const current = getCapabilityNodeBySlug(currentSlug);

  // Score all nodes
  const scored = CAPABILITY_NODES
    .filter((n) => n.slug !== currentSlug)
    .map((node) => ({ node, score: scoreCapabilityNode(node, decision, visitedSlugs) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const nextCapabilities = scored.slice(0, 3).map((s) => s.node);

  // Build advisory path from current node's pathNext
  let advisoryPath: CapabilityNode[] = [];
  if (current) {
    advisoryPath = current.advisoryPathNext
      .map((id) => {
        // advisoryPathNext contains IDs, not slugs
        return CAPABILITY_NODES.find((n) => n.id === id) ?? null;
      })
      .filter((n): n is CapabilityNode => n !== null)
      .slice(0, 4);
  } else {
    // If not on a capability page, build path from top-scoring nodes
    advisoryPath = nextCapabilities.slice(0, 3);
  }

  const rationale = buildDiscoveryRationale(decision, current, nextCapabilities);

  return { current, nextCapabilities, advisoryPath, rationale };
}

// ── Get related capabilities from current page ────────────
export function getRelatedFromCurrentPage(
  session: AdvisorySession,
  decision: AdvisoryDecision,
  limit = 3
): CapabilityNode[] {
  const current = getCapabilityNodeBySlug(session.pageContext.slug);
  if (!current) {
    const result = computeCapabilityDiscovery(session, decision);
    return result.nextCapabilities.slice(0, limit);
  }

  const related = getRelatedCapabilities(current.id);
  const visitedSlugs = new Set(session.intelligence.pagesVisited);

  return related
    .map((node) => ({ node, score: scoreCapabilityNode(node, decision, visitedSlugs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.node);
}

// ── Build rationale string ────────────────────────────────
function buildDiscoveryRationale(
  decision: AdvisoryDecision,
  current: CapabilityNode | null,
  nextCapabilities: CapabilityNode[]
): string {
  const intentStr = `intent=${decision.intent.primary}`;
  const personaStr = `persona=${decision.maturity.persona}`;
  const currentStr = current ? `current=${current.id}` : "current=none";
  const nextStr = nextCapabilities.map((n) => n.id).join(",");
  return `${intentStr} ${personaStr} ${currentStr} next=[${nextStr}]`;
}
