"use client";

import { motion } from "framer-motion";
import type { CapabilityNode, Locale } from "@/types";

interface CapabilityDiscoveryPanelProps {
  capabilities: CapabilityNode[];
  locale: Locale;
  title?: string;
  compact?: boolean;
}

export function CapabilityDiscoveryPanel({
  capabilities,
  locale,
  title,
  compact = false,
}: CapabilityDiscoveryPanelProps) {
  if (capabilities.length === 0) return null;

  const defaultTitle =
    locale === "pl" ? "Odkryj powiązane obszary" : "Explore related areas";

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
        {title ?? defaultTitle}
      </h3>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {capabilities.map((capability, index) => (
          <CapabilityCard
            key={capability.id}
            capability={capability}
            locale={locale}
            index={index}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

// ── Single capability card ────────────────────────────────
interface CapabilityCardProps {
  capability: CapabilityNode;
  locale: Locale;
  index: number;
  compact: boolean;
}

function CapabilityCard({ capability, locale, index, compact }: CapabilityCardProps) {
  return (
    <motion.a
      href={capability.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.07, ease: "easeOut" }}
      className={`group block rounded-lg border border-gray-200 dark:border-gray-800 hover:border-advisory-300 dark:hover:border-advisory-700 bg-white dark:bg-gray-950 hover:bg-advisory-50/40 dark:hover:bg-advisory-950/20 transition-all ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-gray-900 dark:text-gray-100 group-hover:text-advisory-800 dark:group-hover:text-advisory-300 transition-colors ${compact ? "text-xs" : "text-sm"}`}
          >
            {capability.name[locale]}
          </p>
          {!compact && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2">
              {capability.description[locale]}
            </p>
          )}
        </div>
        <span className="text-gray-400 group-hover:text-advisory-600 dark:group-hover:text-advisory-400 transition-colors flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>

      {/* Intent tags — tiny chips */}
      {!compact && capability.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {capability.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide uppercase bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.a>
  );
}

// ── Advisory Path — linear journey visualization ──────────
interface AdvisoryPathProps {
  path: CapabilityNode[];
  locale: Locale;
  currentId?: string;
}

export function AdvisoryPath({ path, locale, currentId }: AdvisoryPathProps) {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {path.map((node, index) => (
        <div key={node.id} className="flex items-center gap-1">
          <a
            href={node.slug}
            className={`text-xs font-medium rounded px-2 py-1 transition-colors ${
              node.id === currentId
                ? "bg-advisory-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-advisory-100 hover:text-advisory-800"
            }`}
          >
            {node.shortLabel[locale]}
          </a>
          {index < path.length - 1 && (
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
