"use client";

import { motion } from "framer-motion";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { ASSISTANT_STRINGS } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface AssistantTriggerProps {
  locale: Locale;
}

export function AssistantTrigger({ locale }: AssistantTriggerProps) {
  const { isOpen, openAssistant, closeAssistant, session } = useAdvisorySession();
  const strings = ASSISTANT_STRINGS[locale];

  const hasActivity =
    session && session.messages.length > 0;

  return (
    <motion.button
      className="advisory-trigger"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
      onClick={isOpen ? closeAssistant : openAssistant}
      aria-label={strings.triggerAriaLabel}
      aria-expanded={isOpen}
      whileTap={{ scale: 0.97 }}
    >
      {/* Icon — procurement/advisory motif */}
      <span
        aria-hidden="true"
        className="flex items-center justify-center w-5 h-5 relative"
      >
        {/* Activity dot when there's conversation history */}
        {hasActivity && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#0092D9] rounded-full" />
        )}
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" fill="currentColor" />
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>

      <span className="text-sm font-medium">{strings.triggerLabel}</span>
    </motion.button>
  );
}
