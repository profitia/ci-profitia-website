// ─────────────────────────────────────────────────────────
// CI-Profitia — ETAP 3 Orchestrator
// Coordinates all ETAP 3 engines and returns ETAP3Decision.
// Called alongside the ETAP 2 advisory orchestrator.
// Pure function — no side effects.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryDecision,
  AdvisorySession,
  ETAP3Decision,
} from "@/types";
import {
  computeBlockPlacementDecision,
} from "../inline-advisory/placement-engine";
import { computeWidgetDecision } from "../contextual-widgets/widget-orchestrator";
import { computeCapabilityDiscovery } from "../capability-discovery/advisory-path-engine";
import { computeCTADecision } from "../embedded-cta/cta-intelligence";
import { computeNavigationDecision } from "../conversational-navigation/navigation-intelligence";
import { computeAdaptivePageConfig } from "../adaptive-page/adaptive-page-engine";
import { detectExecutiveProfile } from "../i18n/advisory-content";

// ── ETAP 3 Orchestrator ───────────────────────────────────

/**
 * Run all ETAP 3 intelligence engines.
 * Takes the base AdvisoryDecision from ETAP 2 as input context.
 * Returns ETAP3Decision that drives all embedded advisory rendering.
 */
export function runETAP3Orchestrator(
  session: AdvisorySession,
  baseDecision: AdvisoryDecision
): ETAP3Decision {
  // 1. Inline Advisory Blocks — choose which blocks to embed in page
  const inlineBlocks = computeBlockPlacementDecision(session, baseDecision);

  // 2. Contextual Widgets — dynamic widget selection and ranking
  const widgets = computeWidgetDecision(session, baseDecision);

  // 3. Conversational Navigation — next-step guidance
  const navigation = computeNavigationDecision(session, baseDecision);

  // 4. Adaptive CTA — persona + intent + urgency aware CTAs
  const cta = computeCTADecision(session, baseDecision);

  // 5. Capability Discovery — next-best-capability path
  const capability = computeCapabilityDiscovery(session, baseDecision);

  // 6. Adaptive Page Config — section ordering + highlight
  const adaptivePage = computeAdaptivePageConfig(session, baseDecision);

  // 7. Executive Profile — role-specific messaging angle
  const executiveProfile = detectExecutiveProfile(baseDecision.maturity.persona);

  return {
    inlineBlocks,
    widgets,
    navigation,
    cta,
    capability,
    adaptivePage,
    executiveProfile,
  };
}

// ── Serialize ETAP 3 context for LLM injection ────────────
export function serializeETAP3ForPrompt(etap3: ETAP3Decision): string {
  const lines: string[] = [];

  lines.push("[ETAP3 — Embedded Advisory Context]");

  // Primary widget context
  if (etap3.widgets.primaryWidget) {
    const w = etap3.widgets.primaryWidget;
    lines.push(`Active widget: ${w.type} — "${w.title}"`);
  }

  // Primary inline block
  if (etap3.inlineBlocks.primary) {
    const b = etap3.inlineBlocks.primary;
    lines.push(`Inline block (${b.section}): ${b.type} — "${b.headline}"`);
  }

  // Navigation hint
  if (etap3.navigation.hint) {
    const h = etap3.navigation.hint;
    lines.push(
      `Navigation suggestion: ${h.targetSlug}`
    );
  }

  // CTA recommendation
  const cta = etap3.cta.primary;
  lines.push(`Recommended CTA: ${cta.type} → ${cta.url}`);

  // Capability path
  if (etap3.capability.nextCapabilities.length > 0) {
    const next = etap3.capability.nextCapabilities
      .slice(0, 2)
      .map((c) => c.id)
      .join(", ");
    lines.push(`Next capabilities: ${next}`);
  }

  // Executive context
  lines.push(`Executive mode: ${etap3.adaptivePage.executiveMode ? "yes" : "no"}`);
  lines.push(`Executive role: ${etap3.executiveProfile.role}`);
  lines.push(`Messaging angle: ${etap3.executiveProfile.messagingAngle}`);

  return lines.join("\n");
}
