#!/usr/bin/env npx tsx
// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Advisory Penetration Test Runner
//
// Usage:
//   npx tsx src/testing/advisory-penetration/run-penetration.ts
//   npx tsx src/testing/advisory-penetration/run-penetration.ts --category B-negotiation-intelligence
//   npx tsx src/testing/advisory-penetration/run-penetration.ts --scenario E-009
//   npx tsx src/testing/advisory-penetration/run-penetration.ts --dry-run
//   npx tsx src/testing/advisory-penetration/run-penetration.ts --url http://localhost:3001
// ─────────────────────────────────────────────────────────

import path from "path";
import { runBatch } from "./runners/batch-runner";
import { buildPenetrationReport, saveReport } from "./reporters/report-generator";
import { saveMultilingualReport } from "./reporters/multilingual-reporter";
import { aggregateScores } from "./analytics/score-aggregator";
import { SCENARIO_STATS } from "./scenarios/index";
import type { RunOptions, ScenarioCategory } from "./types/index";

// ── Parse CLI args ────────────────────────────────────────

function parseArgs(): Partial<RunOptions> & { dryRun: boolean } {
  const args = process.argv.slice(2);
  const result: Partial<RunOptions> & { dryRun: boolean } = { dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") result.dryRun = true;
    if (arg === "--verbose") result.verbose = true;
    if (arg === "--url" && args[i + 1]) { result.baseUrl = args[++i]; }
    if (arg === "--category" && args[i + 1]) {
      result.categoryFilter = args[++i] as ScenarioCategory;
    }
    if (arg === "--scenario" && args[i + 1]) {
      result.scenarioIdFilter = args[++i];
    }
    if (arg === "--delay" && args[i + 1]) {
      result.delayBetweenCallsMs = parseInt(args[++i], 10);
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
ETAP 7.5 — Advisory Penetration Test Runner

Usage:
  npx tsx src/testing/advisory-penetration/run-penetration.ts [options]

Options:
  --url <url>           Base URL of the server (default: http://localhost:3000)
  --category <cat>      Run only one category:
                        A-procurement-operations
                        B-negotiation-intelligence
                        C-executive-conversations
                        D-psychology-tests
                        E-adversarial-tests
                        F-multilingual-tests
  --scenario <id>       Run a single scenario by ID (e.g. E-009)
  --dry-run             List scenarios without running them
  --verbose             Show per-turn word counts and timing
  --delay <ms>          Delay between turns (default: 800)
  --help, -h            Show this help

Examples:
  npx tsx src/testing/advisory-penetration/run-penetration.ts
  npx tsx src/testing/advisory-penetration/run-penetration.ts --category E-adversarial-tests --verbose
  npx tsx src/testing/advisory-penetration/run-penetration.ts --scenario B-007
  npx tsx src/testing/advisory-penetration/run-penetration.ts --dry-run
`);
}

// ── Paths ─────────────────────────────────────────────────

const TESTING_ROOT = path.resolve(__dirname);
const TRANSCRIPTS_DIR = path.join(TESTING_ROOT, "transcripts");
const REPORTS_DIR = path.join(TESTING_ROOT, "reports");

// ── Main ──────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();

  const options: RunOptions = {
    baseUrl: args.baseUrl ?? "http://localhost:3000",
    delayBetweenCallsMs: args.delayBetweenCallsMs ?? 800,
    delayBetweenScenariosMs: 1500,
    maxConcurrency: 1,
    saveTranscripts: true,
    transcriptsDir: TRANSCRIPTS_DIR,
    reportsDir: REPORTS_DIR,
    screenshotsDir: path.join(TESTING_ROOT, "ux-tests"),
    verbose: args.verbose ?? false,
    categoryFilter: args.categoryFilter,
    scenarioIdFilter: args.scenarioIdFilter,
    dryRun: args.dryRun,
  };

  console.log("═══════════════════════════════════════════════════════════");
  console.log(" ETAP 7.5 — Advisory Penetration Test System");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\nTarget: ${options.baseUrl}`);
  console.log(`Scenario catalog: ${SCENARIO_STATS.total} scenarios`);
  console.log(`  PL: ${SCENARIO_STATS.plScenarios} | EN: ${SCENARIO_STATS.enScenarios} | Mixed: ${SCENARIO_STATS.mixedScenarios}`);
  console.log(`  Adversarial: ${SCENARIO_STATS.adversarialCount}\n`);
  console.log(`Transcripts → ${TRANSCRIPTS_DIR}`);
  console.log(`Reports     → ${REPORTS_DIR}\n`);
  console.log("═══════════════════════════════════════════════════════════\n");

  const startTime = Date.now();

  // Run the batch
  const batchResult = await runBatch(options);

  if (options.dryRun) {
    console.log("\n[dry-run] No API calls made. Done.");
    return;
  }

  if (batchResult.transcripts.length === 0) {
    console.log("\nNo transcripts to report on. Exiting.");
    return;
  }

  const runDurationMs = Date.now() - startTime;

  // Generate reports
  console.log("\n[reports] Generating reports...");

  const report = buildPenetrationReport(batchResult.transcripts, runDurationMs, options.baseUrl);
  await saveReport(report, REPORTS_DIR);
  await saveMultilingualReport(batchResult.transcripts, REPORTS_DIR);

  const aggregate = aggregateScores(batchResult.transcripts);

  // Final summary
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(" PENETRATION TEST COMPLETE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\nOverall Score: ${report.overallScore}/100`);
  console.log(`Scenarios: ${batchResult.completedScenarios}/${batchResult.totalScenarios} completed`);
  if (batchResult.failedScenarios > 0) {
    console.log(`FAILED: ${batchResult.failedScenarios} scenarios (server errors or timeouts)`);
  }
  console.log(`\nScore Percentiles:`);
  console.log(`  P25: ${aggregate.scorePercentile.p25} | P50: ${aggregate.scorePercentile.p50} | P75: ${aggregate.scorePercentile.p75} | P90: ${aggregate.scorePercentile.p90}`);
  console.log(`\nCategory Results:`);
  for (const cat of aggregate.byCategory) {
    const bar = "█".repeat(Math.round(cat.avgOverall / 10)) + "░".repeat(10 - Math.round(cat.avgOverall / 10));
    console.log(`  ${cat.category.padEnd(35)} ${bar} ${cat.avgOverall}/100`);
  }

  if (report.criticalFindings.length > 0) {
    console.log(`\n⚠️  CRITICAL FINDINGS (${report.criticalFindings.length}):`);
    for (const f of report.criticalFindings.slice(0, 5)) {
      console.log(`   ${f}`);
    }
    if (report.criticalFindings.length > 5) {
      console.log(`   ... and ${report.criticalFindings.length - 5} more. See report.`);
    }
  }

  console.log(`\nPriority Fixes:`);
  for (const fix of report.priorityFixes.slice(0, 5)) {
    console.log(`  🔧 ${fix}`);
  }

  console.log(`\nReports saved to: ${REPORTS_DIR}`);
  console.log(`  → FULL-ADVISORY-PENETRATION-REPORT.md`);
  console.log(`  → MULTILINGUAL-GAP-REPORT.md`);
  console.log(`  → penetration-report.json`);
  console.log(`\nTranscripts saved to: ${TRANSCRIPTS_DIR}`);
  console.log("\n═══════════════════════════════════════════════════════════\n");

  // Exit with non-zero if critical failures found
  if (report.criticalFindings.length > 0 || report.securityAssessment < 70) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[run-penetration] Fatal error:", err);
  process.exit(1);
});
