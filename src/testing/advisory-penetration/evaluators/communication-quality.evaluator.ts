// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Communication Quality Evaluator
// Scores: verbosity, structure, tone, question quality.
// Range: 0–100
// ─────────────────────────────────────────────────────────

import type { TurnRecord, AdvisoryScenario } from "../types/index";

// ── AI-sounding / helpdesk patterns (penalize) ────────────

const AI_TONE_PATTERNS = [
  /great question/i, /certainly!/i, /of course!/i, /i'd be happy to/i,
  /as an ai/i, /how can i help/i, /is there anything else/i, /absolutely!/i,
  /świetne pytanie/i, /oczywiście!/i, /chętnie pomogę/i, /jak mogę pomóc/i,
  /rozumiem że to trudne/i, /to musi być trudne/i, /happy to assist/i,
  /let me help you/i,
];

const HELPDESK_PATTERNS = [
  /let me know if you have any questions/i, /feel free to ask/i,
  /don't hesitate to reach out/i, /I'm here to help/i,
  /nie wahaj się pytać/i, /jestem do dyspozycji/i,
  /chętnie odpowiem na pytania/i,
];

const OVERLY_STRUCTURED_PATTERNS = [
  /^#{1,3}\s/m, // markdown headers used excessively
];

// ── Scorer ────────────────────────────────────────────────

export function evaluateCommunicationQuality(
  turn: TurnRecord,
  scenarioIndex: number,
  scenario: AdvisoryScenario
): number {
  const resp = turn.assistantResponse;
  let score = 80; // Start high — penalize problems

  const wordCount = turn.wordCount;
  const bulletCount = turn.bulletCount;
  const questionCount = turn.questionCount;

  // 1. Verbosity scoring (ideal: 80–350 words)
  if (wordCount < 30) {
    score -= 20; // Too short — no substance
  } else if (wordCount < 60) {
    score -= 10;
  } else if (wordCount >= 80 && wordCount <= 350) {
    score += 10; // Ideal range
  } else if (wordCount > 500) {
    score -= 15; // Too long
  } else if (wordCount > 700) {
    score -= 25; // Way too long
  }

  // 2. Bullet overload
  if (bulletCount > 8) {
    score -= 20;
  } else if (bulletCount > 5) {
    score -= 10;
  } else if (bulletCount > 3) {
    score -= 5;
  }

  // 3. AI-sounding tone (each pattern -8)
  const aiMatches = AI_TONE_PATTERNS.filter((p) => p.test(resp)).length;
  score -= aiMatches * 8;

  // 4. Helpdesk tone (each -5)
  const helpdeskMatches = HELPDESK_PATTERNS.filter((p) => p.test(resp)).length;
  score -= helpdeskMatches * 5;

  // 5. Overly structured (markdown headers)
  const headerMatches = (resp.match(/^#{1,3}\s/gm) ?? []).length;
  if (headerMatches >= 3) {
    score -= 10; // Too much structure = helpdesk/bot feel
  }

  // 6. Diagnostic question quality
  const scenarioTurn = scenario.turns[scenarioIndex];
  if (scenarioTurn?.expectsDiagnosticQuestion) {
    if (questionCount > 0 && questionCount <= 2) {
      score += 10; // One or two focused questions is ideal
    } else if (questionCount > 3) {
      score -= 10; // Too many questions = information overload
    } else if (questionCount === 0) {
      score -= 15; // Missed diagnosis opportunity
    }
  }

  // 7. Very short response when depth is expected
  const isExecutiveOrNegotiationScenario =
    scenario.category === "C-executive-conversations" ||
    scenario.category === "B-negotiation-intelligence";
  if (isExecutiveOrNegotiationScenario && wordCount < 80) {
    score -= 15; // Too thin for complex topics
  }

  return Math.max(0, Math.min(100, score));
}
