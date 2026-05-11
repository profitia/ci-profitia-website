// ─────────────────────────────────────────────────────────
// CIC Runtime — Index
// Single import point for the entire CIC Runtime layer.
// ─────────────────────────────────────────────────────────

// ── Schemas ───────────────────────────────────────────────
export * from "./schemas";

// ── Deployment ────────────────────────────────────────────
export * from "./deployment/deployment-registry";

// ── Engines ───────────────────────────────────────────────
export { runOrchestrationRuntime } from "./engines/orchestration-runtime";
export { runRecommendationRuntime } from "./engines/recommendation-runtime";
export { runSessionRuntime } from "./engines/session-runtime";
export { computePersonalization } from "./engines/personalization-runtime";
export { allocateExperiments, getExperimentPayload } from "./engines/experimentation-runtime";
export {
  buildOptimizationOutput,
  computeCTAStrength,
  computeEscalationTiming,
  computeRecommendationPacing,
  optimizeJourney,
} from "./engines/optimization-runtime";
export {
  buildProcurementContext,
  getDomainForIntent,
  getReasoningPattern,
  getBusinessImpacts,
  REASONING_PATTERNS,
  BUSINESS_IMPACTS,
} from "./engines/procurement-intelligence";
export {
  buildRuntimeSystemPrompt,
  emitOrchestrationEvent,
  emitPersonalizationEvent,
  emitRecommendationEvents,
  emitEscalationEvent,
} from "./engines/streaming-runtime";
export {
  resolveLocale,
  getLocaleVariant,
  getCTALabel,
  getMultilingualInstruction,
  getUrgencyInstruction,
  TONE_SYSTEM_HINTS,
  CTA_LABELS,
} from "./engines/multilingual-runtime";
