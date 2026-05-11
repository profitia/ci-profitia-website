// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Procurement Quality Evaluator
// Scores how well the assistant performs as a procurement expert.
// Range: 0–100
// ─────────────────────────────────────────────────────────

import type { TurnRecord, AdvisoryScenario } from "../types/index";

// ── PL + EN procurement quality signals ──────────────────

const PL_PROCUREMENT_TERMS = [
  "marż", "oszczędności", "dostawc", "kategorii", "benchmark", "koszty", "negocjacj",
  "spend", "zakup", "przetarg", "kontrakt", "warunki", "analiz", "should-cost",
  "eAukcja", "RFQ", "BATNA", "rynek", "dane", "cena", "podwyżka", "wolumen",
  "priorytet", "dźwigni", "strategi", "model kosztow",
];

const EN_PROCUREMENT_TERMS = [
  "margin", "savings", "supplier", "category", "benchmark", "costs", "negotiat",
  "spend", "procurement", "tender", "contract", "terms", "analys", "should-cost",
  "eAuction", "RFQ", "BATNA", "market", "data", "price", "increase", "volume",
  "priority", "leverage", "strateg", "cost model",
];

const PL_BUSINESS_IMPACT_TERMS = [
  "EBIT", "cash flow", "marż", "rentowność", "wynik", "budżet", "PLN", "mln",
  "procent", "redukcja", "oszczędności", "ROI", "zwrot",
];

const EN_BUSINESS_IMPACT_TERMS = [
  "EBIT", "cash flow", "margin", "profitability", "result", "budget", "€", "million",
  "percent", "reduction", "savings", "ROI", "return",
];

const NUMBER_PATTERN = /\b\d+[\.,]?\d*(%|mln|PLN|€|k|tys|zł)?\b/i;
const SPECIFIC_ACTION_PATTERN = /najpierw|krok|następnie|przede wszystkim|first|step|priority|concrete|konkretnie|zacząć od|start with/i;

// ── Evaluator ─────────────────────────────────────────────

export function evaluateProcurementQuality(
  turn: TurnRecord,
  scenarioIndex: number,
  scenario: AdvisoryScenario
): number {
  const resp = turn.assistantResponse;
  const locale = scenario.locale;
  let score = 50; // Start at midpoint

  const terms = locale === "en" ? EN_PROCUREMENT_TERMS : PL_PROCUREMENT_TERMS;
  const impactTerms = locale === "en" ? EN_BUSINESS_IMPACT_TERMS : PL_BUSINESS_IMPACT_TERMS;

  // +25: At least 3 procurement domain terms present
  const termMatches = terms.filter((t) => resp.toLowerCase().includes(t.toLowerCase())).length;
  if (termMatches >= 5) score += 25;
  else if (termMatches >= 3) score += 15;
  else if (termMatches >= 1) score += 5;
  else score -= 15;

  // +15: Business impact framing
  const impactMatches = impactTerms.filter((t) => resp.toLowerCase().includes(t.toLowerCase())).length;
  if (impactMatches >= 2) score += 15;
  else if (impactMatches >= 1) score += 7;

  // +10: Specific numbers mentioned
  if (NUMBER_PATTERN.test(resp)) score += 10;

  // +10: Specific actions / concrete steps
  if (SPECIFIC_ACTION_PATTERN.test(resp)) score += 10;

  // +10: Expected keywords matched
  const scenarioTurn = scenario.turns[scenarioIndex];
  if (scenarioTurn?.expectedKeywords && scenarioTurn.expectedKeywords.length > 0) {
    const matched = scenarioTurn.expectedKeywords.filter((kw) =>
      resp.toLowerCase().includes(kw.toLowerCase())
    );
    const ratio = matched.length / scenarioTurn.expectedKeywords.length;
    score += Math.round(ratio * 15);
  }

  // -10: No diagnostic question when short response and first turn
  if (scenarioIndex === 0 && scenarioTurn?.expectsDiagnosticQuestion) {
    if (!resp.includes("?")) score -= 10;
  }

  // -20: Forbidden phrases appeared
  if (scenarioTurn?.forbiddenPhrases) {
    const forbidden = scenarioTurn.forbiddenPhrases.filter((p) =>
      resp.toLowerCase().includes(p.toLowerCase())
    );
    score -= forbidden.length * 10;
  }

  return Math.max(0, Math.min(100, score));
}
