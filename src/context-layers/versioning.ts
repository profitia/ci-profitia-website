// ─────────────────────────────────────────────────────────
// CIC — Context Layer Versioning
//
// Tracks runtime compatibility, version history and
// upgrade paths for ContextLayer artifacts.
// ─────────────────────────────────────────────────────────

export const CONTEXT_RUNTIME_VERSION = "1.0.0";

export interface VersionCompatibility {
  compatible: boolean;
  reason?: string;
  minimumVersion?: string;
}

/**
 * Checks whether a context layer version is compatible with
 * the current context runtime version.
 * Major version must match (breaking change boundary).
 */
export function checkVersionCompatibility(
  layerVersion: string,
): VersionCompatibility {
  const [layerMajor] = layerVersion.split(".").map(Number);
  const [runtimeMajor] = CONTEXT_RUNTIME_VERSION.split(".").map(Number);

  if (layerMajor !== runtimeMajor) {
    return {
      compatible: false,
      reason: `Major version mismatch: layer=${layerVersion}, runtime=${CONTEXT_RUNTIME_VERSION}`,
      minimumVersion: `${runtimeMajor}.0.0`,
    };
  }

  return { compatible: true };
}

/**
 * Returns whether a version string represents a breaking change
 * relative to a previous version.
 */
export function isBreakingUpgrade(fromVersion: string, toVersion: string): boolean {
  const [fromMajor] = fromVersion.split(".").map(Number);
  const [toMajor] = toVersion.split(".").map(Number);
  return toMajor > fromMajor;
}

/**
 * Validates that a version string follows semver (major.minor.patch).
 */
export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}
