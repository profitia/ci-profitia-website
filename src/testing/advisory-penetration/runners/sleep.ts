// ─────────────────────────────────────────────────────────
// Sleep utility — avoids importing nanoid-compat everywhere
// ─────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
