"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavigationHint as NavigationHintType, Locale } from "@/types";

interface NavigationHintProps {
  hint: NavigationHintType;
  locale: Locale;
  autoDismissMs?: number;
  onDismiss?: () => void;
}

export function NavigationHint({
  hint,
  locale,
  autoDismissMs = 8000,
  onDismiss,
}: NavigationHintProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={hint.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full mx-4"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3">
            {/* Direction icon */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-advisory-100 dark:bg-advisory-900 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-advisory-700 dark:text-advisory-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            {/* Message + CTA */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                {hint.message[locale]}
              </p>
              <a
                href={hint.targetSlug}
                className="inline-block mt-0.5 text-xs font-semibold text-advisory-700 hover:text-advisory-900 dark:text-advisory-400 transition-colors"
              >
                {hint.targetLabel[locale]} →
              </a>
            </div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={locale === "pl" ? "Zamknij" : "Dismiss"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Auto-dismiss progress bar */}
          {autoDismissMs > 0 && (
            <motion.div
              className="mt-1 h-0.5 rounded-full bg-advisory-400/40 dark:bg-advisory-600/40 origin-left mx-1"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoDismissMs / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Inline navigation hint — embedded in page content ─────
interface InlineNavigationHintProps {
  hint: NavigationHintType;
  locale: Locale;
}

export function InlineNavigationHint({ hint, locale }: InlineNavigationHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 text-sm text-advisory-700 dark:text-advisory-400"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
      <a
        href={hint.targetSlug}
        className="font-medium hover:text-advisory-900 dark:hover:text-advisory-300 transition-colors"
      >
        {hint.message[locale]}
      </a>
    </motion.div>
  );
}
