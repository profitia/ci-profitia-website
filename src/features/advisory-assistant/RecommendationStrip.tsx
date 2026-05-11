"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { getRecommendationsForIntent } from "@/lib/recommendation-registry";
import { track } from "@/lib/analytics";
import type { IntentCode, UrgencyLevel, Locale, RecommendationCard } from "@/types";

interface RecommendationStripProps {
  intent: IntentCode;
  urgency: UrgencyLevel;
  confidence: number;
  shownIds: string[];
  locale: Locale;
}

export function RecommendationStrip({
  intent,
  urgency,
  confidence,
  shownIds,
  locale,
}: RecommendationStripProps) {
  const { markRecommendationShown } = useAdvisorySession();

  const recommendations = getRecommendationsForIntent(
    intent,
    urgency,
    confidence,
    shownIds
  ).slice(0, 2);

  useEffect(() => {
    recommendations.forEach((r) => {
      markRecommendationShown(r.id);
      track.recommendationShown(r.id, r.title);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (recommendations.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 space-y-2">
      <p className="advisory-label">
        {locale === "pl" ? "Rekomendowane" : "Relevant for your situation"}
      </p>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <RecommendationCardItem
            key={rec.id}
            rec={rec}
            index={i}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCardItem({
  rec,
  index,
  locale,
}: {
  rec: RecommendationCard;
  index: number;
  locale: Locale;
}) {
  const handleClick = () => {
    track.recommendationClicked(rec.id, rec.url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
    >
      <Link
        href={rec.url}
        onClick={handleClick}
        className="rec-card flex items-start gap-3 group block"
      >
        {/* Priority indicator */}
        <div
          className="w-1 rounded-full flex-shrink-0 mt-1 self-stretch"
          style={{
            background:
              rec.priority === "HIGHEST"
                ? "#242F44"
                : rec.priority === "HIGH"
                ? "#006D9E"
                : "#9CA3AF",
            minHeight: "2rem",
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 leading-snug group-hover:text-[#006D9E] transition-colors">
            {rec.title}
          </p>
          <p className="text-2xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
            {rec.description}
          </p>
        </div>
        <span className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}
