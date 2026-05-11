"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { analytics } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

/**
 * Tracks page context changes as user navigates the site.
 * Updates the advisory session and analytics engine.
 */
export function usePageContext(locale: Locale) {
  const pathname = usePathname();
  const { updatePageContext } = useAdvisorySession();

  useEffect(() => {
    // Strip locale prefix to get clean slug
    const slug = pathname.replace(`/${locale}`, "") || "/";
    updatePageContext(slug);
    analytics.updateContext(locale, slug as any);
  }, [pathname, locale, updatePageContext]);
}
