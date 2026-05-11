"use client";

import { motion } from "framer-motion";
import type { AdvisoryBlock, Locale } from "@/types";
import { useAdvisorySession } from "@/stores/advisory-session.store";

interface InlineAdvisoryBlockProps {
  block: AdvisoryBlock;
  locale: Locale;
  variant?: "default" | "compact" | "highlight";
}

export function InlineAdvisoryBlock({
  block,
  locale,
  variant = "default",
}: InlineAdvisoryBlockProps) {
  const { markRecommendationShown, markCTAShown } = useAdvisorySession();

  const handleCTAClick = () => {
    markCTAShown(block.id + "-cta");
  };

  const blockTypeStyles: Record<AdvisoryBlock["type"], string> = {
    insight:
      "border-l-4 border-advisory-600 bg-advisory-50/60 dark:bg-advisory-950/30",
    benchmark:
      "border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30",
    proof_point:
      "border-l-4 border-green-600 bg-green-50/60 dark:bg-green-950/30",
    workshop_prompt:
      "border-l-4 border-violet-500 bg-violet-50/60 dark:bg-violet-950/30",
    roi_insight:
      "border-l-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30",
    risk_insight:
      "border-l-4 border-red-500 bg-red-50/60 dark:bg-red-950/30",
    executive_summary:
      "border-l-4 border-slate-700 bg-slate-50/70 dark:bg-slate-900/50",
    capability_teaser:
      "border-l-4 border-advisory-500 bg-advisory-50/50 dark:bg-advisory-950/20",
    diagnostic_question:
      "border-l-4 border-sky-500 bg-sky-50/60 dark:bg-sky-950/30",
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`rounded-lg px-4 py-3 ${blockTypeStyles[block.type]}`}
        onAnimationComplete={() => markRecommendationShown(block.id)}
      >
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
          {block.body}
        </p>
        <a
          href={block.cta.url}
          onClick={handleCTAClick}
          className="mt-2 inline-block text-xs font-semibold text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 transition-colors"
        >
          {block.cta.label} →
        </a>
      </motion.div>
    );
  }

  if (variant === "highlight") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl border border-advisory-200 dark:border-advisory-800 bg-white dark:bg-gray-950 shadow-advisory p-6"
        onAnimationComplete={() => markRecommendationShown(block.id)}
      >
        <BlockTypeLabel type={block.type} locale={locale} />
        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {block.headline}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {block.body}
        </p>
        {block.metric && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-advisory-700 dark:text-advisory-400">
              {block.metric.value}
            </span>
            <span className="text-xs text-gray-500">{block.metric.label}</span>
          </div>
        )}
        <a
          href={block.cta.url}
          onClick={handleCTAClick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-advisory-700 px-4 py-2 text-sm font-semibold text-white hover:bg-advisory-800 transition-colors"
        >
          {block.cta.label}
          <span aria-hidden="true">→</span>
        </a>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-lg px-5 py-4 ${blockTypeStyles[block.type]}`}
      onAnimationComplete={() => markRecommendationShown(block.id)}
    >
      <BlockTypeLabel type={block.type} locale={locale} />
      <h4 className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {block.headline}
      </h4>
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {block.body}
      </p>
      {block.metric && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          <span className="font-bold text-advisory-700 dark:text-advisory-400">
            {block.metric.value}
          </span>{" "}
          {block.metric.label}
        </p>
      )}
      <a
        href={block.cta.url}
        onClick={handleCTAClick}
        className="mt-3 inline-block text-sm font-semibold text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 transition-colors"
      >
        {block.cta.label} →
      </a>
    </motion.div>
  );
}

// ── Block type label chip ─────────────────────────────────
const BLOCK_TYPE_LABELS: Record<
  AdvisoryBlock["type"],
  Record<Locale, string>
> = {
  insight: { pl: "Insight", en: "Insight" },
  benchmark: { pl: "Benchmark", en: "Benchmark" },
  proof_point: { pl: "Dowód", en: "Proof point" },
  workshop_prompt: { pl: "Warsztat", en: "Workshop" },
  roi_insight: { pl: "ROI", en: "ROI" },
  risk_insight: { pl: "Ryzyko", en: "Risk" },
  executive_summary: { pl: "Executive", en: "Executive" },
  capability_teaser: { pl: "Capability", en: "Capability" },
  diagnostic_question: { pl: "Diagnoza", en: "Diagnostic" },
};

function BlockTypeLabel({
  type,
  locale,
}: {
  type: AdvisoryBlock["type"];
  locale: Locale;
}) {
  return (
    <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-advisory-600 dark:text-advisory-500 opacity-70">
      {BLOCK_TYPE_LABELS[type][locale]}
    </span>
  );
}
