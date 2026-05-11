"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { AssistantTrigger } from "./AssistantTrigger";
import { AssistantPanel } from "./AssistantPanel";
import { ProactivePrompt } from "./ProactivePrompt";
import type { Locale } from "@/lib/i18n";

interface AdvisoryAssistantProps {
  locale: Locale;
}

export function AdvisoryAssistant({ locale }: AdvisoryAssistantProps) {
  const { isOpen, isInitialized, initSession } = useAdvisorySession();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const slug = window.location.pathname.replace(`/${locale}`, "") || "/";
    initSession(locale, slug);
  }, [locale, initSession]);

  if (!isInitialized) return null;

  return (
    <>
      {/* Proactive prompt — shows before assistant is opened */}
      {!isOpen && <ProactivePrompt locale={locale} />}

      {/* Floating trigger button */}
      <AssistantTrigger locale={locale} />

      {/* Advisory panel — slides up when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="advisory-panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="advisory-panel"
            aria-label="Procurement advisory assistant"
          >
            <AssistantPanel locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
