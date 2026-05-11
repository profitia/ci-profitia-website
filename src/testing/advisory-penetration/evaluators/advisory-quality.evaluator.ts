// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Advisory Quality Evaluator
// Scores whether the assistant behaves like a senior advisor:
// escalation timing, diagnosis quality, recommendation sharpness.
// Range: 0–100
// ─────────────────────────────────────────────────────────

import type { TurnRecord, AdvisoryScenario } from "../types/index";

// ── Escalation CTA patterns ───────────────────────────────

const ESCALATION_PATTERNS = [
  /kontakt|konsultant|rozmow|20.minut|spot|discover|umów|spotkanie/i,
  /contact|consultant|conversation|20.minute|spot analysis|schedule|call/i,
  /profitia\.pl|calendly|booking/i,
];

// ── Service mention patterns ──────────────────────────────

const SERVICE_MENTION_PATTERNS = [
  /SPOT Analysis|analiza spot/i,
  /negotiation support|wsparcie negocjacyjne/i,
  /category strategy|strategia kategorii/i,
  /procurement transformation|transformacja zakupów/i,
];

// ── Strong advisor patterns (reward) ─────────────────────

const SHARP_ADVISORY_PATTERNS = [
  /najpierw|first|priorytet|priority/i,
  /konkretnie|specifically|precyzyjnie/i,
  /nie akceptuj|don't accept|reject|odrzuć/i,
  /benchmark|should-cost|BATNA/i,
  /dane rynkowe|market data|analiz/i,
];

// ── Diagnosis patterns ────────────────────────────────────

const DIAGNOSIS_PATTERNS = [
  /jaka kategoria|what category/i,
  /jaki spend|what spend/i,
  /jakie masz alternatyw|what alternatives/i,
  /kiedy wygasa|when does it expire/i,
  /co konkretnie|what specifically/i,
  /proszę powiedzieć więcej|can you tell me more/i,
];

// ── Evaluator ─────────────────────────────────────────────

export function evaluateAdvisoryQuality(
  turn: TurnRecord,
  turnIndex: number,
  scenario: AdvisoryScenario
): number {
  const resp = turn.assistantResponse;
  const scenarioTurn = scenario.turns[turnIndex];
  let score = 60; // Baseline

  // 1. Escalation when expected
  if (scenarioTurn?.expectsEscalation) {
    const hasEscalation = ESCALATION_PATTERNS.some((p) => p.test(resp));
    if (hasEscalation) score += 20;
    else score -= 20;
  }

  // 2. Passive escalation value: service mentions when relevant
  if (!scenarioTurn?.expectsEscalation) {
    const hasServiceMention = SERVICE_MENTION_PATTERNS.some((p) => p.test(resp));
    if (hasServiceMention) score += 5;
  }

  // 3. Diagnosis question quality
  if (scenarioTurn?.expectsDiagnosticQuestion) {
    const hasDiagnosis = DIAGNOSIS_PATTERNS.some((p) => p.test(resp));
    const hasAnyQuestion = resp.includes("?");
    if (hasDiagnosis) score += 15;
    else if (hasAnyQuestion) score += 7;
    else score -= 15;
  }

  // 4. Sharp advisory signals (reward each up to +20 total)
  const sharpMatches = SHARP_ADVISORY_PATTERNS.filter((p) => p.test(resp)).length;
  score += Math.min(20, sharpMatches * 5);

  // 5. Business framing
  const businessFraming = /marż|EBIT|cash|koszt|savings|oszczędności|margin|PLN|€|revenue|przychód/i;
  if (businessFraming.test(resp)) score += 10;

  // 6. Penalize if response starts with company/product pitch
  if (/^(Profitia|SpendGuru|nasza platforma|our platform)/i.test(resp.trim())) {
    score -= 20; // Starts with sales pitch = bad advisor behavior
  }

  // 7. Multi-turn: later turns should add value not repeat
  if (turnIndex > 0 && turn.wordCount < 50) {
    score -= 10; // Later turn too thin
  }

  return Math.max(0, Math.min(100, score));
}
