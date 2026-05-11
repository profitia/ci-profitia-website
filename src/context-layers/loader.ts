// ─────────────────────────────────────────────────────────
// CIC — Context Loader
//
// Resolves which ContextLayers are active for a given
// ContextResolutionRequest. Applies deployment, locale and
// activation condition filtering.
//
// Pure functions — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  ContextLayer,
  ContextActivationCondition,
  ContextResolutionRequest,
} from "./types";
import { contextRegistry } from "./registry";

// ── Condition matching ────────────────────────────────────

function conditionMatches(
  cond: ContextActivationCondition,
  req: ContextResolutionRequest
): boolean {
  if (
    cond.deployments &&
    cond.deployments.length > 0 &&
    !cond.deployments.includes("all") &&
    !cond.deployments.includes(req.deployment)
  ) {
    return false;
  }

  if (
    cond.locales &&
    cond.locales.length > 0 &&
    !cond.locales.includes("all") &&
    !cond.locales.includes(req.locale)
  ) {
    return false;
  }

  if (
    req.urgency &&
    cond.urgencyLevels &&
    cond.urgencyLevels.length > 0 &&
    !cond.urgencyLevels.includes(req.urgency)
  ) {
    return false;
  }

  if (
    req.maturity &&
    cond.maturityLevels &&
    cond.maturityLevels.length > 0 &&
    !cond.maturityLevels.includes(req.maturity)
  ) {
    return false;
  }

  if (
    req.intent &&
    cond.intentMatches &&
    cond.intentMatches.length > 0 &&
    !cond.intentMatches.includes(req.intent)
  ) {
    return false;
  }

  if (
    req.executiveRole &&
    cond.executiveRoles &&
    cond.executiveRoles.length > 0 &&
    !cond.executiveRoles.includes("all") &&
    !cond.executiveRoles.includes(req.executiveRole)
  ) {
    return false;
  }

  return true;
}

// ── Layer eligibility ─────────────────────────────────────

function layerIsEligible(layer: ContextLayer, req: ContextResolutionRequest): boolean {
  // Deployment scope
  if (
    !layer.deployments.includes("all") &&
    !layer.deployments.includes(req.deployment)
  ) {
    return false;
  }

  // Locale scope
  if (
    !layer.locales.includes("all") &&
    !layer.locales.includes(req.locale)
  ) {
    return false;
  }

  // Default activation condition
  if (!conditionMatches(layer.defaultActivation, req)) {
    return false;
  }

  return true;
}

// ── Public API ────────────────────────────────────────────

/**
 * Returns all eligible ContextLayers for the given request,
 * sorted by priority descending (highest priority first).
 */
export function resolveContextLayers(req: ContextResolutionRequest): ContextLayer[] {
  return contextRegistry
    .getAll()
    .filter((layer) => layerIsEligible(layer, req))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Returns the single highest-priority eligible layer, or undefined.
 */
export function resolvePrimaryLayer(
  req: ContextResolutionRequest
): ContextLayer | undefined {
  return resolveContextLayers(req)[0];
}

// Re-export conditionMatches for use in orchestrator
export { conditionMatches };
