// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Nanoid Compatibility Shim
// nanoid v5 is ESM-only. This wrapper ensures it works in
// Node.js script context (tsx execution).
// ─────────────────────────────────────────────────────────

import { randomUUID } from "crypto";

export function nanoid(): string {
  return randomUUID().replace(/-/g, "").slice(0, 21);
}
