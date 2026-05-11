// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Multilingual Gap Reporter
// Compares PL vs EN scenario performance and generates
// a dedicated MULTILINGUAL-GAP-REPORT.md
// ─────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import type { ConversationTranscript } from "../types/index";

interface LocaleComparison {
  plScore: number;
  enScore: number;
  gap: number;
  plProcurement: number;
  enProcurement: number;
  plCommunication: number;
  enCommunication: number;
}

interface CategoryLocaleBreakdown {
  category: string;
  plScenarios: number;
  enScenarios: number;
  plAvgScore: number;
  enAvgScore: number;
  gap: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function buildMultilingualReport(transcripts: ConversationTranscript[]): string {
  const completed = transcripts.filter((t) => !t.runError);

  const plTranscripts = completed.filter((t) => t.scenario.locale === "pl");
  const enTranscripts = completed.filter((t) => t.scenario.locale === "en");
  const mixedTranscripts = completed.filter((t) => t.scenario.locale === "mixed");

  const overall: LocaleComparison = {
    plScore: avg(plTranscripts.map((t) => t.evaluation.overallScore)),
    enScore: avg(enTranscripts.map((t) => t.evaluation.overallScore)),
    gap: 0,
    plProcurement: avg(plTranscripts.map((t) => t.evaluation.procurementIntelligence)),
    enProcurement: avg(enTranscripts.map((t) => t.evaluation.procurementIntelligence)),
    plCommunication: avg(plTranscripts.map((t) => t.evaluation.uxQuality)),
    enCommunication: avg(enTranscripts.map((t) => t.evaluation.uxQuality)),
  };
  overall.gap = overall.plScore - overall.enScore;

  // F-category direct comparisons (F-001 vs F-002, F-003 vs F-004, etc.)
  const directComparisons: Array<{
    plId: string;
    enId: string;
    plScore: number;
    enScore: number;
    gap: number;
    topic: string;
  }> = [];

  const directPairs: Array<[string, string, string]> = [
    ["F-001", "F-002", "Procurement Operations — supplier price increase"],
    ["F-003", "F-004", "Negotiation Intelligence — anchoring counter"],
    ["F-009", "F-010", "Executive short prompts — savings target"],
  ];

  for (const [plId, enId, topic] of directPairs) {
    const pl = completed.find((t) => t.scenarioId === plId);
    const en = completed.find((t) => t.scenarioId === enId);
    if (pl && en) {
      directComparisons.push({
        plId,
        enId,
        plScore: pl.evaluation.overallScore,
        enScore: en.evaluation.overallScore,
        gap: pl.evaluation.overallScore - en.evaluation.overallScore,
        topic,
      });
    }
  }

  // Category breakdown
  const categories = [
    "A-procurement-operations",
    "B-negotiation-intelligence",
    "C-executive-conversations",
    "D-psychology-tests",
    "E-adversarial-tests",
    "F-multilingual-tests",
  ];

  const categoryBreakdown: CategoryLocaleBreakdown[] = categories.map((cat) => {
    const catCompleted = completed.filter((t) => t.scenario.category === cat);
    const plCat = catCompleted.filter((t) => t.scenario.locale === "pl");
    const enCat = catCompleted.filter((t) => t.scenario.locale === "en");
    const plAvg = avg(plCat.map((t) => t.evaluation.overallScore));
    const enAvg = avg(enCat.map((t) => t.evaluation.overallScore));
    return {
      category: cat,
      plScenarios: plCat.length,
      enScenarios: enCat.length,
      plAvgScore: plAvg,
      enAvgScore: enAvg,
      gap: plAvg - enAvg,
    };
  });

  // Qualitative assessment
  const maxGap = Math.abs(overall.gap);
  let qualitativeAssessment: string;
  if (maxGap <= 5) {
    qualitativeAssessment = "✅ **EXCELLENT PARITY** — PL and EN advisory quality is virtually identical.";
  } else if (maxGap <= 15) {
    qualitativeAssessment = "⚠️ **MODERATE GAP** — Minor differences between PL and EN. Monitor closely.";
  } else {
    qualitativeAssessment = `❌ **SIGNIFICANT GAP (${maxGap} points)** — Advisory quality is unequal across languages. Requires attention.`;
  }

  const lines: string[] = [
    `# MULTILINGUAL GAP REPORT`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Analyzed:** ${plTranscripts.length} PL scenarios, ${enTranscripts.length} EN scenarios, ${mixedTranscripts.length} mixed`,
    ``,
    `---`,
    ``,
    `## Overall Assessment`,
    ``,
    qualitativeAssessment,
    ``,
    `---`,
    ``,
    `## PL vs EN Overall Scores`,
    ``,
    `| Metric | Polish (PL) | English (EN) | Gap |`,
    `|--------|------------|--------------|-----|`,
    `| Overall Score | ${overall.plScore}/100 | ${overall.enScore}/100 | ${overall.gap > 0 ? "+" : ""}${overall.gap} |`,
    `| Procurement Intelligence | ${overall.plProcurement}/100 | ${overall.enProcurement}/100 | ${overall.plProcurement - overall.enProcurement > 0 ? "+" : ""}${overall.plProcurement - overall.enProcurement} |`,
    `| Communication Quality | ${overall.plCommunication}/100 | ${overall.enCommunication}/100 | ${overall.plCommunication - overall.enCommunication > 0 ? "+" : ""}${overall.plCommunication - overall.enCommunication} |`,
    ``,
    `---`,
    ``,
    `## Direct PL vs EN Comparison (Identical Scenarios)`,
    ``,
    directComparisons.length > 0
      ? [
          `| Topic | PL Score | EN Score | Gap |`,
          `|-------|---------|---------|-----|`,
          ...directComparisons.map(
            (c) =>
              `| ${c.topic} | ${c.plScore}/100 (${c.plId}) | ${c.enScore}/100 (${c.enId}) | ${c.gap > 0 ? "+" : ""}${c.gap} |`
          ),
        ].join("\n")
      : "_Direct comparison scenarios not yet run._",
    ``,
    `---`,
    ``,
    `## Category Language Breakdown`,
    ``,
    `| Category | PL Scenarios | EN Scenarios | PL Score | EN Score | Gap |`,
    `|----------|-------------|-------------|---------|---------|-----|`,
    ...categoryBreakdown.map(
      (c) =>
        `| ${c.category} | ${c.plScenarios} | ${c.enScenarios} | ${c.plAvgScore > 0 ? c.plAvgScore + "/100" : "N/A"} | ${c.enAvgScore > 0 ? c.enAvgScore + "/100" : "N/A"} | ${c.gap > 0 ? "+" : ""}${c.gap || "—"} |`
    ),
    ``,
    `---`,
    ``,
    `## Mixed Language Handling`,
    ``,
    mixedTranscripts.length > 0
      ? [
          `${mixedTranscripts.length} mixed-language scenarios tested.`,
          `Average score: ${avg(mixedTranscripts.map((t) => t.evaluation.overallScore))}/100`,
          ``,
          ...mixedTranscripts.map(
            (t) => `- **${t.scenarioId}** (${t.scenario.title}): ${t.evaluation.overallScore}/100`
          ),
        ].join("\n")
      : "_No mixed-language scenarios completed._",
    ``,
    `---`,
    ``,
    `## Recommendations`,
    ``,
    ...(overall.gap > 10
      ? ["- EN advisory responses need richer procurement terminology"]
      : []),
    ...(overall.gap < -10
      ? ["- PL advisory responses are weaker than EN — check Polish-language context layers"]
      : []),
    ...(directComparisons.some((c) => Math.abs(c.gap) > 15)
      ? ["- Significant parity issue found in direct comparison — investigate context layer locale handling"]
      : []),
    `- Run F-category scenarios regularly to maintain multilingual quality tracking`,
    ``,
    `---`,
    ``,
    `_Generated by ETAP 7.5 Multilingual Reporter_`,
  ];

  return lines.join("\n");
}

export async function saveMultilingualReport(
  transcripts: ConversationTranscript[],
  reportsDir: string
): Promise<void> {
  await fs.mkdir(reportsDir, { recursive: true });
  const md = buildMultilingualReport(transcripts);
  await fs.writeFile(path.join(reportsDir, "MULTILINGUAL-GAP-REPORT.md"), md, "utf-8");
  console.log(`[multilingual-reporter] Report saved to ${reportsDir}`);
}
