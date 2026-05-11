// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Scenario Barrel + Catalog
// Total: 120 scenarios across 6 categories
// ─────────────────────────────────────────────────────────

export { A_PROCUREMENT_OPERATIONS } from "./A-procurement-operations";
export { B_NEGOTIATION_INTELLIGENCE } from "./B-negotiation-intelligence";
export { C_EXECUTIVE_CONVERSATIONS } from "./C-executive-conversations";
export { D_PSYCHOLOGY_TESTS } from "./D-psychology-tests";
export { E_ADVERSARIAL_TESTS } from "./E-adversarial-tests";
export { F_MULTILINGUAL_TESTS } from "./F-multilingual-tests";

import { A_PROCUREMENT_OPERATIONS } from "./A-procurement-operations";
import { B_NEGOTIATION_INTELLIGENCE } from "./B-negotiation-intelligence";
import { C_EXECUTIVE_CONVERSATIONS } from "./C-executive-conversations";
import { D_PSYCHOLOGY_TESTS } from "./D-psychology-tests";
import { E_ADVERSARIAL_TESTS } from "./E-adversarial-tests";
import { F_MULTILINGUAL_TESTS } from "./F-multilingual-tests";
import type { AdvisoryScenario, ScenarioCategory } from "../types/index";

export const ALL_SCENARIOS: AdvisoryScenario[] = [
  ...A_PROCUREMENT_OPERATIONS,
  ...B_NEGOTIATION_INTELLIGENCE,
  ...C_EXECUTIVE_CONVERSATIONS,
  ...D_PSYCHOLOGY_TESTS,
  ...E_ADVERSARIAL_TESTS,
  ...F_MULTILINGUAL_TESTS,
];

export const SCENARIO_CATALOG: Record<ScenarioCategory, AdvisoryScenario[]> = {
  "A-procurement-operations": A_PROCUREMENT_OPERATIONS,
  "B-negotiation-intelligence": B_NEGOTIATION_INTELLIGENCE,
  "C-executive-conversations": C_EXECUTIVE_CONVERSATIONS,
  "D-psychology-tests": D_PSYCHOLOGY_TESTS,
  "E-adversarial-tests": E_ADVERSARIAL_TESTS,
  "F-multilingual-tests": F_MULTILINGUAL_TESTS,
};

export function getScenarioById(id: string): AdvisoryScenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosByCategory(category: ScenarioCategory): AdvisoryScenario[] {
  return SCENARIO_CATALOG[category] ?? [];
}

export function getScenariosByTag(tag: string): AdvisoryScenario[] {
  return ALL_SCENARIOS.filter((s) => s.tags?.includes(tag));
}

export function getAdversarialScenarios(): AdvisoryScenario[] {
  return ALL_SCENARIOS.filter((s) => s.adversarial === true);
}

export const SCENARIO_STATS = {
  total: ALL_SCENARIOS.length,
  byCategory: Object.fromEntries(
    Object.entries(SCENARIO_CATALOG).map(([cat, scenarios]) => [cat, scenarios.length])
  ) as Record<ScenarioCategory, number>,
  adversarialCount: ALL_SCENARIOS.filter((s) => s.adversarial).length,
  plScenarios: ALL_SCENARIOS.filter((s) => s.locale === "pl").length,
  enScenarios: ALL_SCENARIOS.filter((s) => s.locale === "en").length,
  mixedScenarios: ALL_SCENARIOS.filter((s) => s.locale === "mixed").length,
};
