// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Batch Runner
// Runs all advisory scenarios sequentially with options
// for category/scenario filtering, delay, and dry-run mode.
// ─────────────────────────────────────────────────────────

import { runConversation } from "./conversation-runner";
import { ALL_SCENARIOS, getScenariosByCategory, getScenarioById } from "../scenarios/index";
import type { AdvisoryScenario, ConversationTranscript, RunOptions } from "../types/index";
import { compositeEvaluator } from "../evaluators/composite-evaluator";
import { saveTranscript } from "../reporters/transcript-recorder";
import { sleep } from "./sleep";

// ── Build run list ────────────────────────────────────────

function buildRunList(options: RunOptions): AdvisoryScenario[] {
  if (options.scenarioIdFilter) {
    const found = getScenarioById(options.scenarioIdFilter);
    return found ? [found] : [];
  }
  if (options.categoryFilter) {
    return getScenariosByCategory(options.categoryFilter);
  }
  return ALL_SCENARIOS;
}

// ── Server health check ───────────────────────────────────

async function checkServerHealth(baseUrl: string): Promise<boolean> {
  // Any HTTP response (even 3xx/4xx) means the server is up
  const endpoints = [`${baseUrl}/api/chat`, `${baseUrl}/api/health`, baseUrl];
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        redirect: "manual",
      });
      // status 0 = opaque redirect, any numeric status = server is up
      if (response.status >= 0) return true;
    } catch {
      // connection refused or timeout — try next endpoint
    }
  }
  return false;
}

// ── Main batch runner ─────────────────────────────────────

export interface BatchRunResult {
  transcripts: ConversationTranscript[];
  totalScenarios: number;
  completedScenarios: number;
  failedScenarios: number;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
}

export async function runBatch(options: RunOptions): Promise<BatchRunResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  // Health check
  if (!options.dryRun) {
    console.log(`\n[batch-runner] Checking server at ${options.baseUrl}...`);
    const healthy = await checkServerHealth(options.baseUrl);
    if (!healthy) {
      console.error(
        `[batch-runner] ERROR: Server at ${options.baseUrl} is not responding. ` +
          `Start the server with: npm run dev`
      );
      process.exit(1);
    }
    console.log(`[batch-runner] Server is up.\n`);
  }

  const runList = buildRunList(options);

  if (runList.length === 0) {
    console.error("[batch-runner] No scenarios matched the filter. Check categoryFilter or scenarioIdFilter.");
    return {
      transcripts: [],
      totalScenarios: 0,
      completedScenarios: 0,
      failedScenarios: 0,
      startedAt,
      completedAt: new Date().toISOString(),
      totalDurationMs: 0,
    };
  }

  const categoryFilter = options.categoryFilter ?? "all";
  console.log(
    `[batch-runner] Running ${runList.length} scenarios` +
      (categoryFilter !== "all" ? ` [category: ${categoryFilter}]` : "") +
      (options.dryRun ? " [DRY RUN]" : "") +
      "\n"
  );

  const transcripts: ConversationTranscript[] = [];
  let completedScenarios = 0;
  let failedScenarios = 0;

  for (let i = 0; i < runList.length; i++) {
    const scenario = runList[i];
    const progress = `[${i + 1}/${runList.length}]`;

    if (options.dryRun) {
      console.log(`${progress} DRY-RUN: ${scenario.id} — ${scenario.title}`);
      completedScenarios++;
      continue;
    }

    console.log(`${progress} ${scenario.id} — ${scenario.title}`);

    try {
      const transcript = await runConversation(scenario, {
        baseUrl: options.baseUrl,
        delayBetweenCallsMs: options.delayBetweenCallsMs,
        verbose: options.verbose,
      });

      // Evaluate the transcript
      const evaluation = compositeEvaluator(transcript);
      transcript.evaluation = evaluation;

      transcripts.push(transcript);

      if (transcript.runError) {
        failedScenarios++;
        console.log(`  └─ FAILED: ${transcript.runError}`);
      } else {
        completedScenarios++;
        const score = evaluation.overallScore.toFixed(0);
        const flagCount = evaluation.redFlags.length;
        console.log(`  └─ Score: ${score}/100 | Flags: ${flagCount}`);

        if (evaluation.criticalFindings.length > 0) {
          for (const finding of evaluation.criticalFindings) {
            console.log(`  ⚠️  CRITICAL: ${finding}`);
          }
        }
      }

      // Save transcript if enabled
      if (options.saveTranscripts) {
        try {
          await saveTranscript(transcript, options.transcriptsDir);
        } catch (err) {
          console.error(`  └─ Transcript save failed: ${String(err)}`);
        }
      }

      // Delay between scenarios
      if (i < runList.length - 1) {
        await sleep(options.delayBetweenScenariosMs);
      }
    } catch (err) {
      failedScenarios++;
      console.error(`  └─ UNEXPECTED ERROR: ${String(err)}`);
    }
  }

  const completedAt = new Date().toISOString();
  const totalDurationMs = Date.now() - startTime;

  console.log(
    `\n[batch-runner] Done. ${completedScenarios} completed, ${failedScenarios} failed. ` +
      `Total: ${(totalDurationMs / 1000).toFixed(1)}s\n`
  );

  return {
    transcripts,
    totalScenarios: runList.length,
    completedScenarios,
    failedScenarios,
    startedAt,
    completedAt,
    totalDurationMs,
  };
}
