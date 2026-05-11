// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Score Aggregator
// Aggregates scores across all transcripts for analytics.
// ─────────────────────────────────────────────────────────

import type { ConversationTranscript, EvaluationResult, ScenarioCategory } from "../types/index";

export interface CategoryAggregate {
  category: ScenarioCategory;
  count: number;
  avgOverall: number;
  avgProcurement: number;
  avgNegotiation: number;
  avgCommunication: number;
  avgAdvisory: number;
  avgSecurity: number;
  avgAiTone: number;
  totalRedFlags: number;
  criticalRedFlags: number;
  scoreDistribution: { "0-40": number; "41-60": number; "61-75": number; "76-90": number; "91-100": number };
}

export interface GlobalAggregate {
  totalRun: number;
  completed: number;
  failed: number;
  overallAvg: number;
  byCategory: CategoryAggregate[];
  redFlagFrequency: Array<{ type: string; count: number; percentage: number }>;
  scorePercentile: { p25: number; p50: number; p75: number; p90: number };
  scenariosAbove80: number;
  scenariosBelow50: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.floor((p / 100) * (sortedValues.length - 1));
  return sortedValues[idx];
}

function scoreDistribution(scores: number[]): { "0-40": number; "41-60": number; "61-75": number; "76-90": number; "91-100": number } {
  return {
    "0-40": scores.filter((s) => s <= 40).length,
    "41-60": scores.filter((s) => s > 40 && s <= 60).length,
    "61-75": scores.filter((s) => s > 60 && s <= 75).length,
    "76-90": scores.filter((s) => s > 75 && s <= 90).length,
    "91-100": scores.filter((s) => s > 90).length,
  };
}

const ALL_CATEGORIES: ScenarioCategory[] = [
  "A-procurement-operations",
  "B-negotiation-intelligence",
  "C-executive-conversations",
  "D-psychology-tests",
  "E-adversarial-tests",
  "F-multilingual-tests",
];

export function aggregateScores(transcripts: ConversationTranscript[]): GlobalAggregate {
  const completed = transcripts.filter((t) => !t.runError);
  const failed = transcripts.filter((t) => !!t.runError);
  const evaluations = completed.map((t) => t.evaluation);
  const allScores = evaluations.map((e) => e.overallScore).sort((a, b) => a - b);

  // Per-category aggregates
  const byCategory: CategoryAggregate[] = ALL_CATEGORIES.map((cat) => {
    const catEvals = completed.filter((t) => t.scenario.category === cat).map((t) => t.evaluation);
    const catScores = catEvals.map((e) => e.overallScore);
    return {
      category: cat,
      count: catEvals.length,
      avgOverall: avg(catScores),
      avgProcurement: avg(catEvals.map((e) => e.procurementIntelligence)),
      avgNegotiation: avg(catEvals.map((e) => e.negotiationIntelligence)),
      avgCommunication: avg(catEvals.map((e) => e.uxQuality)),
      avgAdvisory: avg(catEvals.map((e) => e.advisorySharpness)),
      avgSecurity: avg(catEvals.map((e) => e.securityQuality)),
      avgAiTone: avg(catEvals.map((e) => e.aiToneScore)),
      totalRedFlags: catEvals.reduce((s, e) => s + e.totalRedFlags, 0),
      criticalRedFlags: catEvals.reduce((s, e) => s + e.criticalRedFlags, 0),
      scoreDistribution: scoreDistribution(catScores),
    };
  });

  // Red flag frequency
  const allFlags = completed.flatMap((t) => t.evaluation.redFlags);
  const flagCounts = allFlags.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});
  const redFlagFrequency = Object.entries(flagCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / Math.max(1, completed.length)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRun: transcripts.length,
    completed: completed.length,
    failed: failed.length,
    overallAvg: avg(allScores),
    byCategory,
    redFlagFrequency,
    scorePercentile: {
      p25: percentile(allScores, 25),
      p50: percentile(allScores, 50),
      p75: percentile(allScores, 75),
      p90: percentile(allScores, 90),
    },
    scenariosAbove80: allScores.filter((s) => s > 80).length,
    scenariosBelow50: allScores.filter((s) => s < 50).length,
  };
}
