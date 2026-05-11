// ─────────────────────────────────────────────────────────
// CI-Profitia — Inline Advisory Placement Engine
// Scores and selects advisory blocks per current session context.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryBlock,
  AdvisoryDecision,
  AdvisorySession,
  BlockPlacementDecision,
  Locale,
  MaturityPersona,
  PageSection,
} from "@/types";
import { ADVISORY_BLOCK_REGISTRY } from "./advisory-block-registry";

// ── Scoring weights ───────────────────────────────────────
const SCORE_WEIGHTS = {
  intentMatch: 40,
  maturityMatch: 25,
  localeMatch: 20,  // hard filter, but logged
  executiveBonus: 10,
  priorityBonus: 5,
} as const;

// ── Executive role detection from maturity ────────────────
function detectExecutiveRoleFromPersona(
  persona: MaturityPersona
): string | null {
  if (persona === "executive_stakeholder") return "CFO";
  if (persona === "transformation_leader") return "CPO";
  return null;
}

// ── Score a single block against session context ──────────
function scoreBlock(
  block: AdvisoryBlock,
  decision: AdvisoryDecision,
  locale: Locale
): number {
  let score = 0;

  // Hard filter: locale must match
  if (block.locale !== locale) return -1;

  // Intent match (primary + secondary)
  const primaryIntent = decision.intent.primary;
  const secondaryIntent = decision.intent.secondary;
  if (block.intents.includes(primaryIntent)) {
    score += SCORE_WEIGHTS.intentMatch * decision.intent.primaryConfidence;
  } else if (secondaryIntent && block.intents.includes(secondaryIntent)) {
    score += SCORE_WEIGHTS.intentMatch * decision.intent.secondaryConfidence * 0.6;
  }

  // Maturity match
  const persona = decision.maturity.persona;
  if (block.maturityPersonas.includes(persona)) {
    score += SCORE_WEIGHTS.maturityMatch;
  } else if (persona === "unknown") {
    score += SCORE_WEIGHTS.maturityMatch * 0.3; // partial score for unknown
  }

  // Executive role bonus
  const execRole = detectExecutiveRoleFromPersona(persona);
  if (execRole && block.executiveRoles?.includes(execRole as never)) {
    score += SCORE_WEIGHTS.executiveBonus;
  }

  // Priority bonus (normalized 1-10 → 0-5)
  score += (block.priority / 10) * SCORE_WEIGHTS.priorityBonus;

  return score;
}

// ── Compute placement decision ────────────────────────────
export function computeBlockPlacementDecision(
  session: AdvisorySession,
  decision: AdvisoryDecision
): BlockPlacementDecision {
  const locale = session.locale;
  const shownBlockIds = getShownBlockIds(session);

  // Score all blocks
  const scored = ADVISORY_BLOCK_REGISTRY
    .filter((b) => !shownBlockIds.has(b.id))
    .map((block) => ({
      block,
      score: scoreBlock(block, decision, locale),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { blocks: [], primary: null, sections: {} };
  }

  // Top block per section (no duplicate sections)
  const usedSections = new Set<PageSection>();
  const selectedBlocks: AdvisoryBlock[] = [];
  const sections: Partial<Record<PageSection, AdvisoryBlock>> = {};

  for (const { block } of scored) {
    if (!usedSections.has(block.section) && selectedBlocks.length < 5) {
      usedSections.add(block.section);
      selectedBlocks.push(block);
      sections[block.section] = block;
    }
  }

  return {
    blocks: selectedBlocks,
    primary: selectedBlocks[0] ?? null,
    sections,
  };
}

// ── Track shown blocks via session intelligence tags ──────
function getShownBlockIds(session: AdvisorySession): Set<string> {
  // Re-use recommendationsShown for block deduplication (same pattern)
  return new Set(session.intelligence.recommendationsShown);
}

// ── Get blocks for a specific page section ────────────────
export function getBlocksForSection(
  section: PageSection,
  decision: AdvisoryDecision,
  locale: Locale,
  limit = 1
): AdvisoryBlock[] {
  return ADVISORY_BLOCK_REGISTRY
    .filter((b) => b.section === section && b.locale === locale)
    .map((block) => ({ block, score: scoreBlock(block, decision, locale) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.block);
}
