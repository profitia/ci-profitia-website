// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Transcript Recorder
// Saves per-scenario transcripts as markdown + JSON.
// ─────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import type { ConversationTranscript } from "../types/index";

// ── Save transcript to disk ───────────────────────────────

export async function saveTranscript(
  transcript: ConversationTranscript,
  transcriptsDir: string
): Promise<void> {
  const dateStr = new Date(transcript.startedAt).toISOString().slice(0, 10);
  const dir = path.join(transcriptsDir, dateStr, transcript.scenarioId);
  await fs.mkdir(dir, { recursive: true });

  // Save markdown
  const md = formatTranscriptMarkdown(transcript);
  await fs.writeFile(path.join(dir, "transcript.md"), md, "utf-8");

  // Save evaluation JSON
  await fs.writeFile(
    path.join(dir, "evaluation.json"),
    JSON.stringify(transcript.evaluation, null, 2),
    "utf-8"
  );

  // Save metadata JSON
  const metadata = {
    scenarioId: transcript.scenarioId,
    sessionId: transcript.sessionId,
    title: transcript.scenario.title,
    category: transcript.scenario.category,
    locale: transcript.scenario.locale,
    startedAt: transcript.startedAt,
    completedAt: transcript.completedAt,
    totalDurationMs: transcript.totalDurationMs,
    turnCount: transcript.turns.length,
    overallScore: transcript.evaluation.overallScore,
    redFlagCount: transcript.evaluation.totalRedFlags,
    criticalRedFlags: transcript.evaluation.criticalRedFlags,
    runError: transcript.runError,
  };
  await fs.writeFile(
    path.join(dir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf-8"
  );
}

// ── Markdown formatter ────────────────────────────────────

function formatTranscriptMarkdown(transcript: ConversationTranscript): string {
  const { scenario, turns, evaluation, startedAt, completedAt, totalDurationMs, runError } = transcript;

  const lines: string[] = [
    `# ${scenario.id}: ${scenario.title}`,
    ``,
    `**Category:** ${scenario.category}  `,
    `**Locale:** ${scenario.locale}  `,
    `**Started:** ${startedAt}  `,
    `**Completed:** ${completedAt}  `,
    `**Duration:** ${(totalDurationMs / 1000).toFixed(1)}s  `,
    `**Overall Score:** ${evaluation.overallScore}/100  `,
    ``,
    `> ${scenario.description}`,
    ``,
  ];

  if (runError) {
    lines.push(`> ⚠️ **RUN ERROR:** ${runError}`, ``);
  }

  // Evaluation summary
  lines.push(
    `## Evaluation Summary`,
    ``,
    `| Dimension | Score |`,
    `|-----------|-------|`,
    `| Procurement Intelligence | ${evaluation.procurementIntelligence}/100 |`,
    `| Negotiation Intelligence | ${evaluation.negotiationIntelligence}/100 |`,
    `| Executive Advisory | ${evaluation.executiveAdvisory}/100 |`,
    `| Communication Quality | ${evaluation.uxQuality}/100 |`,
    `| Security/Injection Resistance | ${evaluation.securityQuality}/100 |`,
    `| Advisory Sharpness | ${evaluation.advisorySharpness}/100 |`,
    `| Realism | ${evaluation.realism}/100 |`,
    `| AI Tone (100=no AI phrases) | ${evaluation.aiToneScore}/100 |`,
    `| Verbosity | ${evaluation.verbosityScore}/100 |`,
    ``,
  );

  // Flags summary
  if (evaluation.redFlags.length > 0) {
    lines.push(`## Red Flags (${evaluation.totalRedFlags} total, ${evaluation.criticalRedFlags} critical)`, ``);
    for (const flag of evaluation.redFlags) {
      const icon = flag.severity === "critical" ? "🔴" : flag.severity === "high" ? "🟠" : flag.severity === "medium" ? "🟡" : "🟢";
      lines.push(`- ${icon} **[${flag.severity.toUpperCase()}]** \`${flag.type}\` (Turn ${flag.turnIndex + 1}): ${flag.detail}`);
    }
    lines.push(``);
  }

  if (evaluation.criticalFindings.length > 0) {
    lines.push(`## Critical Findings`, ``);
    for (const f of evaluation.criticalFindings) {
      lines.push(`- ⚠️ ${f}`);
    }
    lines.push(``);
  }

  if (evaluation.strengths.length > 0) {
    lines.push(`## Strengths`, ``);
    for (const s of evaluation.strengths) {
      lines.push(`- ✅ ${s}`);
    }
    lines.push(``);
  }

  if (evaluation.recommendations.length > 0) {
    lines.push(`## Recommendations`, ``);
    for (const r of evaluation.recommendations) {
      lines.push(`- 💡 ${r}`);
    }
    lines.push(``);
  }

  // Conversation turns
  lines.push(`## Conversation`, ``);

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const score = turn.turnScore;

    lines.push(
      `### Turn ${i + 1}`,
      ``,
      `**User:**`,
      ``,
      `> ${turn.userMessage}`,
      ``,
      `**Assistant** *(${turn.wordCount} words, ${turn.durationMs}ms)*:`,
      ``,
      turn.assistantResponse || "_[No response]_",
      ``,
      `**Turn Scores:** Procurement: ${score.procurementQuality} | Comm: ${score.communicationQuality} | Advisory: ${score.advisorySharpness} | Security: ${score.injectionResistance} | Composite: ${score.composite}`,
      ``,
    );

    if (turn.flags && turn.flags.length > 0) {
      lines.push(`**Flags:**`);
      for (const f of turn.flags) {
        lines.push(`- [${f.severity}] ${f.type}: ${f.detail}`);
      }
      lines.push(``);
    }

    lines.push(`---`, ``);
  }

  return lines.join("\n");
}
