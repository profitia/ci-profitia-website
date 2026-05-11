// ─────────────────────────────────────────────────────────
// CIC — Context Registry
//
// Central registry of all registered ContextLayer artifacts.
// Import and call register() from domain-contexts/index.ts.
// This is the single source of truth for all available layers.
// ─────────────────────────────────────────────────────────

import type {
  ContextLayer,
  ContextLayerDomain,
  DeploymentId,
  LocaleScope,
} from "./types";

class ContextRegistryStore {
  private layers: Map<string, ContextLayer> = new Map();

  /**
   * Register a context layer. Call this at startup from domain-contexts/index.ts.
   * Re-registering an existing id overwrites the previous version.
   */
  register(layer: ContextLayer): void {
    this.layers.set(layer.id, layer);
  }

  get(id: string): ContextLayer | undefined {
    return this.layers.get(id);
  }

  getAll(): ContextLayer[] {
    return Array.from(this.layers.values());
  }

  getByDomain(domain: ContextLayerDomain): ContextLayer[] {
    return this.getAll().filter((l) => l.domain === domain);
  }

  getForDeployment(deploymentId: DeploymentId): ContextLayer[] {
    return this.getAll().filter(
      (l) =>
        l.deployments.includes(deploymentId) ||
        l.deployments.includes("all")
    );
  }

  getForLocale(locale: LocaleScope): ContextLayer[] {
    return this.getAll().filter(
      (l) => l.locales.includes(locale) || l.locales.includes("all")
    );
  }

  /**
   * Returns the highest-priority layer for a given domain.
   */
  getPrimaryByDomain(domain: ContextLayerDomain): ContextLayer | undefined {
    return this.getByDomain(domain).sort((a, b) => b.priority - a.priority)[0];
  }

  listIds(): string[] {
    return Array.from(this.layers.keys());
  }

  size(): number {
    return this.layers.size;
  }

  /**
   * Health snapshot for monitoring/debug endpoints.
   */
  snapshot(): Record<string, { domain: string; version: string; priority: number }> {
    const out: Record<string, { domain: string; version: string; priority: number }> = {};
    for (const [id, layer] of this.layers) {
      out[id] = {
        domain: layer.domain,
        version: layer.version.version,
        priority: layer.priority,
      };
    }
    return out;
  }
}

// Singleton — all code shares one registry instance
export const contextRegistry = new ContextRegistryStore();
