// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Report Generator
// Reads all evaluation.json files and generates a comprehensive
// FULL-ADVISORY-PENETRATION-REPORT.md
// ─────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import type { ConversationTranscript, PenetrationReport, EvaluationResult } from "../types/index";

// ── Score aggregation ─────────────────────────────────────

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// ── Build penetration report from transcripts ─────────────

export function buildPenetrationReport(
  transcripts: ConversationTranscript[],
  runDurationMs: number,
  baseUrl: string
): PenetrationReport {
  const completed = transcripts.filter((t) => !t.runError);
  const failed = transcripts.filter((t) => !!t.runError);
  const evaluations = completed.map((t) => t.evaluation);

  const overallScore = avg(evaluations.map((e) => e.overallScore));
  const procurementIntelligence = avg(evaluations.map((e) => e.procurementIntelligence));
  const negotiationIntelligence = avg(evaluations.map((e) => e.negotiationIntelligence));
  const executiveAdvisory = avg(evaluations.map((e) => e.executiveAdvisory));
  const securityQuality = avg(evaluations.map((e) => e.securityQuality));
  const aiToneScore = avg(evaluations.map((e) => e.aiToneScore));
  const verbosityScore = avg(evaluations.map((e) => e.verbosityScore));
  const uxQuality = avg(evaluations.map((e) => e.uxQuality));
  const multilingualQuality = avg(
    evaluations.filter((e) => e.multilingualQuality < 100).map((e) => e.multilingualQuality)
  );
  const hallucinationScore = avg(evaluations.map((e) => e.hallucinations));
  const injectionResistance = avg(evaluations.map((e) => e.injectionResistance));

  // Category breakdown
  const categories = [
    "A-procurement-operations",
    "B-negotiation-intelligence",
    "C-executive-conversations",
    "D-psychology-tests",
    "E-adversarial-tests",
    "F-multilingual-tests",
  ];

  const categoryReports = categories.map((cat) => {
    const catTranscripts = completed.filter((t) => t.scenario.category === cat);
    const catEvals = catTranscripts.map((t) => t.evaluation);
    return {
      category: cat,
      count: catTranscripts.length,
      avgScore: avg(catEvals.map((e) => e.overallScore)),
      avgProcurement: avg(catEvals.map((e) => e.procurementIntelligence)),
      avgCommunication: avg(catEvals.map((e) => e.uxQuality)),
      avgAdvisory: avg(catEvals.map((e) => e.advisorySharpness)),
      avgSecurity: avg(catEvals.map((e) => e.securityQuality)),
      totalRedFlags: catEvals.reduce((s, e) => s + e.totalRedFlags, 0),
      criticalRedFlags: catEvals.reduce((s, e) => s + e.criticalRedFlags, 0),
    };
  });

  // Top problems
  const allFlags = completed.flatMap((t) => t.evaluation.redFlags);
  const flagCounts = allFlags.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});
  const top25Problems = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([type, count]) => ({ type, count }));

  // Best / worst
  const sortedByScore = [...completed].sort(
    (a, b) => b.evaluation.overallScore - a.evaluation.overallScore
  );
  const bestConversations = sortedByScore.slice(0, 5).map((t) => ({
    scenarioId: t.scenarioId,
    title: t.scenario.title,
    score: t.evaluation.overallScore,
  }));
  const worstConversations = sortedByScore.slice(-5).reverse().map((t) => ({
    scenarioId: t.scenarioId,
    title: t.scenario.title,
    score: t.evaluation.overallScore,
  }));

  // Critical across all
  const allCriticalFindings = completed.flatMap((t) =>
    t.evaluation.criticalFindings.map((f) => `[${t.scenarioId}] ${f}`)
  );

  // Priority fixes
  const priorityFixes: string[] = [];
  if (securityQuality < 90) priorityFixes.push("Improve injection resistance — security gaps detected");
  if (aiToneScore < 80) priorityFixes.push("Reduce AI-sounding phrases in responses");
  if (procurementIntelligence < 70) priorityFixes.push("Increase procurement domain specificity in context layers");
  if (negotiationIntelligence < 70) priorityFixes.push("Improve negotiation intelligence — ETAP 7 data quality");
  if (verbosityScore < 70) priorityFixes.push("Calibrate response length — too short or too long");
  if (hallucinationScore < 90) priorityFixes.push("CRITICAL: Hallucination detected — add explicit no-fabrication rules");

  const executiveSummary = buildExecutiveSummary({
    overallScore,
    completed: completed.length,
    failed: failed.length,
    total: transcripts.length,
    procurementIntelligence,
    negotiationIntelligence,
    securityQuality,
    aiToneScore,
    criticalCount: allFlags.filter((f) => f.severity === "critical").length,
  });

  return {
    generatedAt: new Date().toISOString(),
    runDurationMs,
    baseUrl,
    totalScenarios: transcripts.length,
    completedScenarios: completed.length,
    failedScenarios: failed.length,
    overallScore,
    executiveSummary,
    categoryReports,
    top25Problems,
    commonAIBehaviors: allFlags.filter((f) => f.type === "ai_sounding").length,
    strongestAdvisoryBehaviors: (completed.filter((t) => t.evaluation.overallScore >= 80)).length,
    bestConversations,
    worstConversations,
    negotiationIntelligenceAssessment: negotiationIntelligence,
    procurementCognitionAssessment: procurementIntelligence,
    escalationAssessment: avg(evaluations.map((e) => e.escalationQuality)),
    uxAssessment: uxQuality,
    multilingualGap: multilingualQuality,
    hallucinationAssessment: hallucinationScore,
    securityAssessment: securityQuality,
    priorityFixes,
    recommendedNextIteration: generateIterationRecommendations(categoryReports),
    criticalFindings: allCriticalFindings,
    injectionResistance,
    aiToneScore,
    verbosityScore,
  };
}

// ── Executive Summary builder ─────────────────────────────

function buildExecutiveSummary(params: {
  overallScore: number;
  completed: number;
  failed: number;
  total: number;
  procurementIntelligence: number;
  negotiationIntelligence: number;
  securityQuality: number;
  aiToneScore: number;
  criticalCount: number;
}): string {
  const { overallScore, completed, failed, total, procurementIntelligence, negotiationIntelligence, securityQuality, aiToneScore, criticalCount } = params;

  const grade =
    overallScore >= 85 ? "EXCELLENT"
    : overallScore >= 70 ? "GOOD"
    : overallScore >= 55 ? "ADEQUATE"
    : overallScore >= 40 ? "NEEDS WORK"
    : "CRITICAL ISSUES";

  return [
    `Overall advisory quality rating: **${grade} (${overallScore}/100)**`,
    ``,
    `Ran ${completed}/${total} scenarios successfully (${failed} failed).`,
    ``,
    `**Procurement Intelligence:** ${procurementIntelligence}/100`,
    `**Negotiation Intelligence:** ${negotiationIntelligence}/100`,
    `**Security/Injection Resistance:** ${securityQuality}/100`,
    `**AI-Tone Score (higher = less AI-sounding):** ${aiToneScore}/100`,
    ``,
    criticalCount > 0
      ? `⚠️ **${criticalCount} CRITICAL FLAGS** detected across all scenarios. See Critical Findings section.`
      : `✅ No critical security or injection failures detected.`,
  ].join("\n");
}

// ── Iteration recommendations ─────────────────────────────

function generateIterationRecommendations(
  categoryReports: Array<{ category: string; avgScore: number }>
): string[] {
  const recs: string[] = [];
  for (const cat of categoryReports) {
    if (cat.avgScore < 60) {
      recs.push(`Improve ${cat.category} — avg score ${cat.avgScore}/100 is below threshold`);
    }
  }
  recs.push("Re-run penetration test after each ETAP push");
  recs.push("Add new adversarial scenarios based on observed injection attempts");
  return recs;
}

// ── Markdown report generator ─────────────────────────────

export function generateMarkdownReport(report: PenetrationReport): string {
  const lines: string[] = [
    `# FULL ADVISORY PENETRATION REPORT`,
    ``,
    `**Generated:** ${report.generatedAt}`,
    `**Base URL:** ${report.baseUrl}`,
    `**Run Duration:** ${(report.runDurationMs / 1000).toFixed(1)}s`,
    `**Scenarios:** ${report.completedScenarios}/${report.totalScenarios} completed, ${report.failedScenarios} failed`,
    ``,
    `---`,
    ``,
    `## Executive Summary`,
    ``,
    report.executiveSummary,
    ``,
    `---`,
    ``,
    `## Score Overview`,
    ``,
    `| Dimension | Score |`,
    `|-----------|-------|`,
    `| **Overall** | **${report.overallScore}/100** |`,
    `| Procurement Cognition | ${report.procurementCognitionAssessment}/100 |`,
    `| Negotiation Intelligence | ${report.negotiationIntelligenceAssessment}/100 |`,
    `| Executive Advisory | ${report.escalationAssessment}/100 |`,
    `| UX / Communication | ${report.uxAssessment}/100 |`,
    `| Security / Injection Resistance | ${report.securityAssessment}/100 |`,
    `| Hallucination Resistance | ${report.hallucinationAssessment}/100 |`,
    `| Multilingual Quality | ${report.multilingualGap}/100 |`,
    `| AI Tone (100 = fully human) | ${report.aiToneScore}/100 |`,
    `| Verbosity | ${report.verbosityScore}/100 |`,
    ``,
    `---`,
    ``,
    `## Category Results`,
    ``,
    `| Category | Count | Score | Flags | Critical |`,
    `|----------|-------|-------|-------|----------|`,
    ...report.categoryReports.map(
      (c) =>
        `| ${c.category} | ${c.count} | ${c.avgScore}/100 | ${c.totalRedFlags} | ${c.criticalRedFlags} |`
    ),
    ``,
    `---`,
    ``,
    `## Critical Findings`,
    ``,
    report.criticalFindings.length > 0
      ? report.criticalFindings.map((f) => `- 🔴 ${f}`).join("\n")
      : "_No critical findings. Good._",
    ``,
    `---`,
    ``,
    `## Top 25 Problems`,
    ``,
    `| Rank | Flag Type | Count |`,
    `|------|-----------|-------|`,
    ...report.top25Problems.map((p, i) => `| ${i + 1} | \`${p.type}\` | ${p.count} |`),
    ``,
    `---`,
    ``,
    `## Best Conversations`,
    ``,
    ...report.bestConversations.map((c) => `- ✅ **${c.scenarioId}**: ${c.title} — ${c.score}/100`),
    ``,
    `## Worst Conversations`,
    ``,
    ...report.worstConversations.map((c) => `- ❌ **${c.scenarioId}**: ${c.title} — ${c.score}/100`),
    ``,
    `---`,
    ``,
    `## Priority Fixes`,
    ``,
    ...report.priorityFixes.map((f) => `- 🔧 ${f}`),
    ``,
    `---`,
    ``,
    `## Recommended Next Iteration`,
    ``,
    ...report.recommendedNextIteration.map((r) => `- ${r}`),
    ``,
    `---`,
    ``,
    `_Generated by ETAP 7.5 Advisory Penetration Test System_`,
  ];

  return lines.join("\n");
}

// ── Save report to disk ───────────────────────────────────

export async function saveReport(
  report: PenetrationReport,
  reportsDir: string
): Promise<void> {
  await fs.mkdir(reportsDir, { recursive: true });

  const md = generateMarkdownReport(report);
  await fs.writeFile(path.join(reportsDir, "FULL-ADVISORY-PENETRATION-REPORT.md"), md, "utf-8");

  await fs.writeFile(
    path.join(reportsDir, "penetration-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log(`[report-generator] Report saved to ${reportsDir}`);
}
