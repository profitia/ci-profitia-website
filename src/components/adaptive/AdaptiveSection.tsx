"use client";

import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import type { PageSection } from "@/types";

interface AdaptiveSectionProps extends PropsWithChildren {
  section: PageSection;
  isHighlighted?: boolean;
  isVisible?: boolean;
  executiveMode?: boolean;
  className?: string;
}

/**
 * AdaptiveSection wraps page sections with behavioral-aware rendering:
 * - Highlighted sections get a subtle advisory ring
 * - Hidden sections render null when isVisible = false
 * - Executive mode applies elevated styling
 */
export function AdaptiveSection({
  children,
  section: _section,
  isHighlighted = false,
  isVisible = true,
  executiveMode = false,
  className = "",
}: AdaptiveSectionProps) {
  if (!isVisible) return null;

  const baseClass = [
    "relative transition-all duration-300",
    isHighlighted
      ? "ring-1 ring-advisory-200/60 dark:ring-advisory-800/40 rounded-2xl"
      : "",
    executiveMode ? "border-l-2 border-slate-700/20 pl-4" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isHighlighted) {
    return (
      <motion.section
        className={baseClass}
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Highlight pulse */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none bg-advisory-50/30 dark:bg-advisory-900/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
        {children}
      </motion.section>
    );
  }

  return <section className={baseClass}>{children}</section>;
}

// ── Adaptive section order helper ─────────────────────────
interface SectionOrderWrapperProps extends PropsWithChildren {
  order: number;
}

/**
 * Applies CSS order for flex/grid-based section reordering.
 * Works when parent uses flex-col or grid with auto layout.
 */
export function SectionOrderWrapper({
  children,
  order,
}: SectionOrderWrapperProps) {
  return <div style={{ order }}>{children}</div>;
}
