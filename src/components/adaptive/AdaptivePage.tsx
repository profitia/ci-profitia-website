"use client";

import { useEffect } from "react";
import type { Locale } from "@/types";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { AdaptiveSection, SectionOrderWrapper } from "./AdaptiveSection";
import { InlineAdvisoryLayer } from "@/components/inline-advisory/InlineAdvisoryLayer";
import { WidgetRow } from "@/components/contextual-widgets/ContextualWidget";
import { CapabilityDiscoveryPanel, AdvisoryPath } from "@/components/capability-discovery/CapabilityDiscoveryPanel";
import { AdaptiveCTA, CTABar } from "@/components/embedded-cta/AdaptiveCTA";
import { NavigationHint } from "@/components/conversational-nav/NavigationHint";

interface AdaptivePageProps {
  locale: Locale;
}

/**
 * AdaptivePage — ETAP 3 orchestration layer.
 *
 * Renders the full adaptive advisory experience over the main
 * Profitia site content. Reads lastETAP3Decision from Zustand and
 * distributes intelligence across all adaptive components.
 */
export function AdaptivePage({ locale }: AdaptivePageProps) {
  const {
    lastETAP3Decision,
    isInitialized,
    session,
    initSession,
    updatePageContext,
  } = useAdvisorySession();

  // Init session on first mount
  useEffect(() => {
    if (!isInitialized) {
      initSession(locale, "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard — no decision yet
  if (!lastETAP3Decision) return null;

  const { inlineBlocks, widgets, navigation, cta, capability, adaptivePage } =
    lastETAP3Decision;

  const highlighted = new Set(adaptivePage.highlightedSections);
  const visible = new Set(adaptivePage.visibleSections);

  return (
    <>
      {/* ── Navigation hint (floating) ── */}
      {navigation.hint && (
        <NavigationHint hint={navigation.hint} locale={locale} autoDismissMs={9000} />
      )}

      {/* ── Advisory content grid ────────────────────────── */}
      <div className="flex flex-col gap-8">
        {/* 1. Widget row — top contextual intelligence */}
        {widgets.widgets.length > 0 && (
          <AdaptiveSection
            section="benchmark"
            isHighlighted={highlighted.has("benchmark")}
            isVisible={visible.has("benchmark")}
          >
            <WidgetRow widgets={widgets.widgets} locale={locale} maxWidgets={3} />
          </AdaptiveSection>
        )}

        {/* 2. Inline advisory blocks — hero / capability sections */}
        {inlineBlocks.blocks.length > 0 && (
          <AdaptiveSection
            section="capability_block"
            isHighlighted={highlighted.has("capability_block")}
            isVisible={visible.has("capability_block")}
          >
            <InlineAdvisoryLayer
              decision={inlineBlocks}
              locale={locale}
              section="capability_block"
              variant={adaptivePage.executiveMode ? "highlight" : "default"}
            />
          </AdaptiveSection>
        )}

        {/* 3. Proof point block if present */}
        {inlineBlocks.sections["proof_point"] && (
          <AdaptiveSection
            section="proof_point"
            isHighlighted={highlighted.has("proof_point")}
            isVisible={visible.has("proof_point")}
          >
            <InlineAdvisoryLayer
              decision={inlineBlocks}
              locale={locale}
              section="proof_point"
              variant="compact"
            />
          </AdaptiveSection>
        )}

        {/* 4. Capability discovery — next best capabilities */}
        {capability.nextCapabilities.length > 0 && (
          <AdaptiveSection
            section="services_overview"
            isHighlighted={highlighted.has("services_overview")}
            isVisible={visible.has("services_overview")}
          >
            <div className="space-y-4">
              {/* Advisory path breadcrumb */}
              {capability.advisoryPath.length > 0 && (
                <AdvisoryPath
                  path={capability.advisoryPath}
                  locale={locale}
                  currentId={capability.current?.id}
                />
              )}

              <CapabilityDiscoveryPanel
                capabilities={capability.nextCapabilities}
                locale={locale}
              />
            </div>
          </AdaptiveSection>
        )}

        {/* 5. ROI / executive block if executive mode */}
        {adaptivePage.executiveMode &&
          inlineBlocks.sections["roi_block"] && (
            <AdaptiveSection
              section="roi_block"
              isHighlighted
              executiveMode
              isVisible
            >
              <InlineAdvisoryLayer
                decision={inlineBlocks}
                locale={locale}
                section="roi_block"
                variant="highlight"
              />
            </AdaptiveSection>
          )}

        {/* 6. CTA bar */}
        {cta.primary && (
          <AdaptiveSection
            section="cta_section"
            isHighlighted={highlighted.has("cta_section")}
            isVisible
          >
            <CTABar
              cta={cta.primary}
              secondary={cta.secondary}
              locale={locale}
            />
          </AdaptiveSection>
        )}

        {/* 7. Footer advisory CTA */}
        {cta.primary && (
          <AdaptiveSection
            section="footer_cta"
            isHighlighted={false}
            isVisible={visible.has("footer_cta")}
          >
            <div className="flex items-center justify-between gap-4 py-2">
              <AdaptiveCTA
                cta={cta.primary}
                secondary={cta.secondary}
                locale={locale}
                size="sm"
              />
            </div>
          </AdaptiveSection>
        )}
      </div>
    </>
  );
}
