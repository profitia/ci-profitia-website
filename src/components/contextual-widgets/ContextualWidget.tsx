"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ContextualWidget, Locale } from "@/types";
import { useAdvisorySession } from "@/stores/advisory-session.store";

interface ContextualWidgetCardProps {
  widget: ContextualWidget;
  locale: Locale;
  compact?: boolean;
}

export function ContextualWidgetCard({
  widget,
  locale,
  compact = false,
}: ContextualWidgetCardProps) {
  const { markRecommendationShown, markCTAShown } = useAdvisorySession();

  const handleCTAClick = () => {
    if (widget.cta) markCTAShown(widget.id + "-cta");
  };

  const widgetAccent: Record<ContextualWidget["type"], string> = {
    recommendation: "bg-advisory-600",
    advisory_insight: "bg-advisory-700",
    proof_point: "bg-green-600",
    benchmark_insight: "bg-amber-500",
    workshop_recommendation: "bg-violet-600",
    transformation_prompt: "bg-purple-700",
    roi_insight: "bg-emerald-600",
    supplier_risk_insight: "bg-red-600",
    executive_summary: "bg-slate-700",
    capability_teaser: "bg-advisory-500",
    diagnostic: "bg-sky-600",
  };

  const accentColor = widgetAccent[widget.type] ?? "bg-advisory-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 ${compact ? "p-4" : "p-5"}`}
      onAnimationComplete={() => markRecommendationShown(widget.id)}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />

      <div className="pl-3">
        {/* Widget type chip */}
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase opacity-60 text-gray-600 dark:text-gray-400 mb-1.5">
          {WIDGET_TYPE_LABELS[widget.type]?.[locale] ?? widget.type}
        </span>

        <h3
          className={`font-semibold text-gray-900 dark:text-gray-100 leading-snug ${compact ? "text-sm" : "text-base"}`}
        >
          {widget.title}
        </h3>

        <p
          className={`mt-2 text-gray-600 dark:text-gray-400 leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
        >
          {widget.content}
        </p>

        {/* Metrics */}
        {widget.metrics && widget.metrics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-4">
            {widget.metrics.map((m, i) => (
              <div key={i} className="flex flex-col">
                <span
                  className={`font-bold text-advisory-700 dark:text-advisory-400 ${compact ? "text-base" : "text-xl"}`}
                >
                  {m.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {widget.cta && (
          <a
            href={widget.cta.url}
            onClick={handleCTAClick}
            className={`mt-3 inline-flex items-center gap-1.5 font-semibold text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 dark:hover:text-advisory-300 transition-colors ${compact ? "text-xs" : "text-sm"}`}
          >
            {widget.cta.label}
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Widget Row — shows up to 3 widgets side by side ───────
interface WidgetRowProps {
  widgets: ContextualWidget[];
  locale: Locale;
  maxWidgets?: number;
}

export function WidgetRow({ widgets, locale, maxWidgets = 3 }: WidgetRowProps) {
  const visible = widgets.slice(0, maxWidgets);
  if (visible.length === 0) return null;

  return (
    <div
      className={`grid gap-4 ${
        visible.length === 1
          ? "grid-cols-1 max-w-xl"
          : visible.length === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {visible.map((widget) => (
        <ContextualWidgetCard
          key={widget.id}
          widget={widget}
          locale={locale}
          compact={visible.length > 1}
        />
      ))}
    </div>
  );
}

// ── Widget type display labels ────────────────────────────
const WIDGET_TYPE_LABELS: Record<ContextualWidget["type"], Record<Locale, string>> = {
  recommendation: { pl: "Rekomendacja", en: "Recommendation" },
  advisory_insight: { pl: "Advisory Insight", en: "Advisory Insight" },
  proof_point: { pl: "Dowód", en: "Proof point" },
  benchmark_insight: { pl: "Benchmark", en: "Benchmark" },
  workshop_recommendation: { pl: "Warsztat", en: "Workshop" },
  transformation_prompt: { pl: "Transformacja", en: "Transformation" },
  roi_insight: { pl: "ROI", en: "ROI" },
  supplier_risk_insight: { pl: "Ryzyko dostawcy", en: "Supplier risk" },
  executive_summary: { pl: "Executive", en: "Executive" },
  capability_teaser: { pl: "Capability", en: "Capability" },
  diagnostic: { pl: "Diagnoza", en: "Diagnostic" },
};
