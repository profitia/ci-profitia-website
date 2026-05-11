"use client";

import { motion } from "framer-motion";
import type { AdaptiveCTAConfig, Locale } from "@/types";
import { useAdvisorySession } from "@/stores/advisory-session.store";

interface AdaptiveCTAProps {
  cta: AdaptiveCTAConfig;
  secondary?: AdaptiveCTAConfig | null;
  locale: Locale;
  size?: "sm" | "md" | "lg";
}

export function AdaptiveCTA({
  cta,
  secondary,
  locale,
  size = "md",
}: AdaptiveCTAProps) {
  const { markCTAShown, markCTAClicked } = useAdvisorySession();

  const handleClick = (id: string) => {
    markCTAShown(id);
    markCTAClicked(id);
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isPhone = cta.type === "phone";
  const href = cta.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-start gap-2"
    >
      {/* Primary CTA */}
      <a
        href={href}
        onClick={() => handleClick(cta.id)}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold bg-advisory-700 text-white hover:bg-advisory-800 active:bg-advisory-900 transition-colors shadow-sm ${sizeStyles[size]}`}
      >
        {isPhone && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0 4.455 1.845 8.477 4.826 11.36a15.877 15.877 0 0011.36 4.826h.014a2.25 2.25 0 002.208-2.207v-3.75a2.25 2.25 0 00-1.857-2.216l-3.5-.583a2.25 2.25 0 00-2.4 1.117l-.496.83A15.866 15.866 0 018.44 12 15.866 15.866 0 016.17 8.443l.831-.496A2.25 2.25 0 008.118 5.55l-.583-3.5A2.25 2.25 0 005.32 2.25H1.57c-.028 0-.056.005-.083.008z" />
          </svg>
        )}
        <span>{cta.label[locale]}</span>
        {!isPhone && <span aria-hidden="true">→</span>}
      </a>

      {/* Sub-label */}
      {cta.subLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {cta.subLabel[locale]}
        </p>
      )}

      {/* Secondary CTA */}
      {secondary && (
        <a
          href={secondary.url}
          onClick={() => handleClick(secondary.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 dark:hover:text-advisory-300 transition-colors"
        >
          {secondary.label[locale]}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </motion.div>
  );
}

// ── CTA Bar — full-width adaptive CTA section ─────────────
interface CTABarProps {
  cta: AdaptiveCTAConfig;
  secondary?: AdaptiveCTAConfig | null;
  locale: Locale;
  context?: string; // e.g. "Supplier Risk" — shown as subtext
}

export function CTABar({ cta, secondary, locale, context }: CTABarProps) {
  const label = cta.label[locale];
  const subLabel = cta.subLabel?.[locale];
  const { markCTAShown, markCTAClicked } = useAdvisorySession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-advisory-100 dark:border-advisory-900 bg-advisory-50/50 dark:bg-advisory-950/20 px-6 py-5"
    >
      <div className="flex-1 min-w-0">
        {context && (
          <p className="text-xs font-bold tracking-widest uppercase text-advisory-600 dark:text-advisory-500 mb-1">
            {context}
          </p>
        )}
        {subLabel && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subLabel}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <a
          href={cta.url}
          onClick={() => {
            markCTAShown(cta.id);
            markCTAClicked(cta.id);
          }}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-advisory-700 text-white hover:bg-advisory-800 transition-colors"
        >
          {label}
          <span aria-hidden="true">→</span>
        </a>
        {secondary && (
          <a
            href={secondary.url}
            onClick={() => {
              markCTAShown(secondary.id);
              markCTAClicked(secondary.id);
            }}
            className="text-sm font-medium text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 transition-colors"
          >
            {secondary.label[locale]}
          </a>
        )}
      </div>
    </motion.div>
  );
}
