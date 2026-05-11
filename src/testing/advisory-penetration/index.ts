// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Advisory Penetration Test System
// Main barrel export
// ─────────────────────────────────────────────────────────

// Types
export * from "./types/index";

// Scenarios
export * from "./scenarios/index";

// Runners
export { callChatAPI, runConversation } from "./runners/conversation-runner";
export { runBatch } from "./runners/batch-runner";
export type { BatchRunResult } from "./runners/batch-runner";

// Evaluators
export { detectRedFlags } from "./evaluators/red-flag-detector";
export { evaluateProcurementQuality } from "./evaluators/procurement-quality.evaluator";
export { evaluateCommunicationQuality } from "./evaluators/communication-quality.evaluator";
export { evaluateAdvisoryQuality } from "./evaluators/advisory-quality.evaluator";
export { evaluateSecurityQuality, isSecurityRelevant } from "./evaluators/security-quality.evaluator";
export { compositeEvaluator } from "./evaluators/composite-evaluator";

// Reporters
export { saveTranscript } from "./reporters/transcript-recorder";
export { buildPenetrationReport, generateMarkdownReport, saveReport } from "./reporters/report-generator";
export { buildMultilingualReport, saveMultilingualReport } from "./reporters/multilingual-reporter";

// Analytics
export { aggregateScores } from "./analytics/score-aggregator";
export type { CategoryAggregate, GlobalAggregate } from "./analytics/score-aggregator";
