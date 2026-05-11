// ─────────────────────────────────────────────────────────
// CIC Runtime — Experimentation Engine
// A/B experiment allocation and management.
// Deterministic allocation based on sessionId hash.
// ─────────────────────────────────────────────────────────

import type {
  ExperimentDefinition,
  ExperimentAllocation,
  ExperimentRequest,
  ExperimentResponse,
} from "../schemas/experiment.schema";

// ── Active experiment registry ────────────────────────────
const ACTIVE_EXPERIMENTS: ExperimentDefinition[] = [
  // ── EXP-001: CTA label test ───────────────────────────
  {
    id: "EXP-001",
    name: "CTA Primary Label",
    description: "Tests different primary CTA labels on the advisory assistant",
    category: "cta",
    status: "active",
    variants: [
      {
        id: "control",
        label: "Porozmawiajmy / Let's talk",
        weight: 0.5,
        payload: { ctaLabel_pl: "Porozmawiajmy", ctaLabel_en: "Let's talk" },
      },
      {
        id: "treatment_a",
        label: "Umówmy się / Book a call",
        weight: 0.5,
        payload: { ctaLabel_pl: "Umówmy się na rozmowę", ctaLabel_en: "Book a 20-minute call" },
      },
    ],
    targeting: {
      locales: ["pl", "en"],
    },
  },

  // ── EXP-002: Escalation tone test ─────────────────────
  {
    id: "EXP-002",
    name: "Escalation Tone",
    description: "Tests assertive vs. consultative escalation messaging",
    category: "escalation",
    status: "active",
    variants: [
      {
        id: "consultative",
        label: "Soft escalation",
        weight: 0.5,
        payload: { escalationStyle: "consultative" },
      },
      {
        id: "assertive",
        label: "Direct escalation",
        weight: 0.5,
        payload: { escalationStyle: "assertive" },
      },
    ],
    targeting: {
      urgencies: ["U1", "U2"],
    },
  },

  // ── EXP-003: Executive intro message ──────────────────
  {
    id: "EXP-003",
    name: "Executive Opening Message",
    description: "Tests EBIT-led vs. risk-led opening for executive personas",
    category: "executive_messaging",
    status: "active",
    variants: [
      {
        id: "ebit_led",
        label: "EBIT-led opening",
        weight: 0.5,
        payload: { executiveOpening: "ebit_focus" },
      },
      {
        id: "risk_led",
        label: "Risk-led opening",
        weight: 0.5,
        payload: { executiveOpening: "risk_focus" },
      },
    ],
    targeting: {
      maturityPersonas: ["executive_stakeholder", "transformation_leader"],
    },
  },

  // ── EXP-004: Proactive trigger timing ─────────────────
  {
    id: "EXP-004",
    name: "Proactive Trigger Delay",
    description: "Tests 30s vs. 60s delay before proactive trigger",
    category: "advisory_journey",
    status: "active",
    variants: [
      {
        id: "fast",
        label: "30s trigger",
        weight: 0.5,
        payload: { proactiveDelayMs: 30000 },
      },
      {
        id: "slow",
        label: "60s trigger",
        weight: 0.5,
        payload: { proactiveDelayMs: 60000 },
      },
    ],
  },
];

// ── Deterministic hash allocation ─────────────────────────
/**
 * Hash sessionId to a stable 0–1 float per experiment.
 * Same sessionId always gets the same variant.
 */
function stableHash(sessionId: string, experimentId: string): number {
  const str = `${experimentId}:${sessionId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32-bit integer
  }
  return (Math.abs(hash) % 10000) / 10000;
}

function allocateVariant(
  sessionId: string,
  experiment: ExperimentDefinition
): string | null {
  const value = stableHash(sessionId, experiment.id);
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (value < cumulative) return variant.id;
  }
  return experiment.variants.at(-1)?.id ?? null;
}

// ── Targeting evaluation ──────────────────────────────────
function matchesTargeting(
  experiment: ExperimentDefinition,
  context: ExperimentRequest["context"]
): boolean {
  const t = experiment.targeting;
  if (!t) return true;

  if (t.locales && !t.locales.includes(context.locale)) return false;
  if (t.maturityPersonas && !t.maturityPersonas.includes(context.maturityPersona)) return false;
  if (t.intents && !t.intents.includes(context.intent)) return false;
  if (t.urgencies && !t.urgencies.includes(context.urgency)) return false;
  if (t.deploymentIds && !t.deploymentIds.includes(context.pageSlug)) return false;
  if (t.newSessionsOnly && !context.isNewSession) return false;

  return true;
}

// ── Main allocation function ──────────────────────────────
export function allocateExperiments(
  request: ExperimentRequest
): ExperimentResponse {
  const { sessionId, context, existingAllocations } = request;
  const allocations: ExperimentAllocation[] = [];
  const variantMap: Record<string, string> = {};

  // Preserve existing allocations
  if (existingAllocations) {
    for (const [expId, variantId] of Object.entries(existingAllocations)) {
      variantMap[expId] = variantId;
    }
  }

  for (const experiment of ACTIVE_EXPERIMENTS) {
    if (experiment.status !== "active") continue;

    // Already allocated — preserve
    if (existingAllocations?.[experiment.id]) {
      const variantId = existingAllocations[experiment.id]!;
      const variant = experiment.variants.find((v) => v.id === variantId);
      if (variant) {
        allocations.push({
          experimentId: experiment.id,
          experimentName: experiment.name,
          variantId: variant.id,
          variantLabel: variant.label,
          payload: variant.payload,
          allocatedAt: Date.now(),
        });
        variantMap[experiment.id] = variantId;
      }
      continue;
    }

    // Check targeting
    if (!matchesTargeting(experiment, context)) continue;

    // Allocate
    const variantId = allocateVariant(sessionId, experiment);
    if (!variantId) continue;

    const variant = experiment.variants.find((v) => v.id === variantId)!;
    allocations.push({
      experimentId: experiment.id,
      experimentName: experiment.name,
      variantId: variant.id,
      variantLabel: variant.label,
      payload: variant.payload,
      allocatedAt: Date.now(),
    });
    variantMap[experiment.id] = variantId;
  }

  return {
    sessionId,
    allocations,
    variantMap,
    timestamp: Date.now(),
  };
}

// ── Payload accessor ──────────────────────────────────────
export function getExperimentPayload<T>(
  variantMap: Record<string, string>,
  experimentId: string
): Partial<T> | null {
  const variantId = variantMap[experimentId];
  if (!variantId) return null;
  const experiment = ACTIVE_EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment) return null;
  const variant = experiment.variants.find((v) => v.id === variantId);
  return (variant?.payload as Partial<T>) ?? null;
}
