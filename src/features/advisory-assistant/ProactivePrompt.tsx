"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import type { Locale } from "@/lib/i18n";

interface ProactivePromptProps {
  locale: Locale;
}

export function ProactivePrompt({ locale }: ProactivePromptProps) {
  const {
    lastDecision,
    proactiveState,
    triggerProactive,
    dismissProactive,
    openAssistant,
    convertProactive,
  } = useAdvisorySession();

  // Evaluate whether to trigger proactive prompt
  useEffect(() => {
    if (proactiveState.triggered || proactiveState.dismissed) return;
    if (!lastDecision?.proactive) return;

    const { score, delay } = lastDecision.proactive;
    if (score < 55) return; // minimum threshold

    const timer = setTimeout(() => {
      triggerProactive();
    }, delay);

    return () => clearTimeout(timer);
  }, [lastDecision?.proactive, proactiveState.triggered, proactiveState.dismissed, triggerProactive]);

  const trigger = proactiveState.trigger;
  const isVisible = proactiveState.triggered && !proactiveState.dismissed && !proactiveState.converted;

  if (!trigger) return null;

  const message = trigger.message[locale] ?? trigger.message["en"];

  const handleOpen = () => {
    convertProactive();
    openAssistant();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed bottom-28 right-6 z-[9998] max-w-xs"
        >
          <div className="bg-white rounded-2xl shadow-advisory-xl border border-gray-100 p-4 relative">
            {/* Dismiss button */}
            <button
              onClick={dismissProactive}
              className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M7.5 2.5L2.5 7.5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Advisor icon */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#242F44] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="1.5" fill="white" />
                  <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 pr-4">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Profitia Advisory
                </p>
                <p className="text-sm text-gray-800 leading-snug">
                  {message}
                </p>
                <button
                  onClick={handleOpen}
                  className="mt-3 text-xs font-semibold text-[#006D9E] hover:text-[#0092D9] transition-colors"
                >
                  {locale === "pl" ? "Odpowiedz →" : "Reply →"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
