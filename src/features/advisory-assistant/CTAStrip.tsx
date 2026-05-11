"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { getPrioritizedCTAs } from "@/lib/cta-registry";
import { track } from "@/lib/analytics";
import type { CTAItem, IntentCode, UrgencyLevel, Locale } from "@/types";

interface CTAStripProps {
  intent: IntentCode;
  urgency: UrgencyLevel;
  locale: Locale;
}

export function CTAStrip({ intent, urgency, locale }: CTAStripProps) {
  const { session, markCTAShown, markCTAClicked } = useAdvisorySession();
  const shownIds = session?.intelligence.ctasShown ?? [];

  const ctas = getPrioritizedCTAs(intent, urgency, shownIds, 2);

  if (ctas.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {ctas.map((cta, i) => (
        <CTAButton
          key={cta.id}
          cta={cta}
          index={i}
          onShow={markCTAShown}
          onClick={markCTAClicked}
          locale={locale}
        />
      ))}
    </div>
  );
}

interface CTAButtonProps {
  cta: CTAItem;
  index: number;
  onShow: (id: string) => void;
  onClick: (id: string) => void;
  locale: Locale;
}

function CTAButton({ cta, index, onShow, onClick, locale }: CTAButtonProps) {
  const isPrimary = index === 0;

  const handleClick = () => {
    onClick(cta.id);
    track.ctaClicked(cta.id, cta.type, cta.url);
  };

  const isExternal = cta.url.startsWith("http") || cta.url.startsWith("tel:") || cta.url.startsWith("mailto:");

  const buttonContent = (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      onClick={handleClick}
      className={isPrimary ? "cta-primary w-full justify-center" : "cta-secondary w-full justify-center"}
    >
      {cta.label}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );

  if (isExternal) {
    return (
      <a
        href={cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <Link href={cta.url} className="block">
      {buttonContent}
    </Link>
  );
}
