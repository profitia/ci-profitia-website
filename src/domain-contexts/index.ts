// ─────────────────────────────────────────────────────────
// CIC — Domain Contexts Registry
//
// This file auto-registers all domain context layers at startup.
// To add a new context layer:
//   1. Create src/domain-contexts/<domain>/<name>.context.ts
//   2. Export it from src/domain-contexts/<domain>/index.ts
//   3. Import and register it here
//
// Registration order does NOT determine priority —
// each ContextLayer carries its own priority: number field.
// ─────────────────────────────────────────────────────────

import { contextRegistry } from "../context-layers/registry";
import { PROCUREMENT_ADVISORY_CONTEXT_V1 } from "./procurement";
import { NEGOTIATION_INTELLIGENCE_CONTEXT_V1 } from "./negotiation";

// ── Register all domain context layers ───────────────────
// Registration order does NOT determine priority —
// each ContextLayer carries its own priority: number field.

contextRegistry.register(PROCUREMENT_ADVISORY_CONTEXT_V1);
contextRegistry.register(NEGOTIATION_INTELLIGENCE_CONTEXT_V1);

// ── Exports ───────────────────────────────────────────────
export { PROCUREMENT_ADVISORY_CONTEXT_V1 } from "./procurement";
export { NEGOTIATION_INTELLIGENCE_CONTEXT_V1 } from "./negotiation";

// Registry stats (for health endpoints / debug)
export { contextRegistry } from "../context-layers/registry";
