// ─────────────────────────────────────────────────────────
// CI-Profitia — Feature Flags
// ─────────────────────────────────────────────────────────

import type { FeatureFlags } from "@/types";

// Default flags — can be overridden via env or runtime config
export const DEFAULT_FLAGS: FeatureFlags = {
  advisoryAssistant: true,
  inlineRecommendations: true,
  behavioralTracking: true,
  streamingResponses: true,
  proactiveEngagement: false, // disabled until tested
  experimentVariant: null,
};

export function getFlags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
  return { ...DEFAULT_FLAGS, ...overrides };
}

export function isEnabled(flag: keyof FeatureFlags): boolean {
  return Boolean(DEFAULT_FLAGS[flag]);
}
