"use client";

import type { BlockPlacementDecision, Locale, PageSection } from "@/types";
import { InlineAdvisoryBlock } from "./InlineAdvisoryBlock";

interface InlineAdvisoryLayerProps {
  decision: BlockPlacementDecision;
  locale: Locale;
  section?: PageSection; // if provided, only render blocks for this section
  variant?: "default" | "compact" | "highlight";
  maxBlocks?: number;
}

/**
 * InlineAdvisoryLayer renders advisory blocks targeted to a specific
 * section or all blocks. Deduplicates by block ID.
 */
export function InlineAdvisoryLayer({
  decision,
  locale,
  section,
  variant = "default",
  maxBlocks = 2,
}: InlineAdvisoryLayerProps) {
  let blocks = section
    ? decision.sections[section]
      ? [decision.sections[section]!]
      : []
    : decision.blocks.slice(0, maxBlocks);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <InlineAdvisoryBlock
          key={block.id}
          block={block}
          locale={locale}
          variant={variant}
        />
      ))}
    </div>
  );
}
