"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import type { BehavioralSignalType } from "@/types";

const SCROLL_DEPTH_THRESHOLD = 0.75; // 75% scroll = deep scroll
const INACTIVITY_TIMEOUT = 45_000; // 45s
const REPEATED_VISIT_KEY = "ci_profitia_visits";
const TIME_ON_PAGE_INTERVAL = 5_000; // update time-on-page every 5s

/**
 * Behavioral engine hook — tracks user signals on the current page
 * and feeds them into the advisory session for intent refinement.
 * ETAP 2: Also tracks scroll depth % and time-on-page in store.
 */
export function useBehavioralEngine() {
  const {
    session,
    addBehavioralSignal,
    incrementEngagement,
    updateScrollDepth,
    updateTimeOnPage,
  } = useAdvisorySession();

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeOnPageTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deepScrollFired = useRef(false);
  const pageStartTime = useRef<number>(Date.now());
  const lastScrollDepth = useRef<number>(0);

  const slug = session?.pageContext.slug ?? "/";

  const fireSignal = useCallback(
    (type: BehavioralSignalType) => {
      if (!session) return;
      addBehavioralSignal({
        type,
        pageSlug: slug,
        timestamp: Date.now(),
      });
    },
    [session, slug, addBehavioralSignal]
  );

  // ── Scroll depth tracking ────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollFraction =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPct = Math.round(scrollFraction * 100);

      // Update store with continuous scroll depth
      if (scrollPct > lastScrollDepth.current) {
        lastScrollDepth.current = scrollPct;
        updateScrollDepth(slug, scrollPct);
      }

      // Fire deep_scroll signal once at 75%
      if (!deepScrollFired.current && scrollFraction >= SCROLL_DEPTH_THRESHOLD) {
        deepScrollFired.current = true;
        fireSignal("deep_scroll");
        incrementEngagement(15);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fireSignal, incrementEngagement, updateScrollDepth, slug]);

  // ── Time-on-page tracking ────────────────────────────────
  useEffect(() => {
    pageStartTime.current = Date.now();

    timeOnPageTimer.current = setInterval(() => {
      const elapsed = Date.now() - pageStartTime.current;
      updateTimeOnPage(slug, elapsed);
    }, TIME_ON_PAGE_INTERVAL);

    return () => {
      if (timeOnPageTimer.current) clearInterval(timeOnPageTimer.current);
      // Final update on unmount
      updateTimeOnPage(slug, Date.now() - pageStartTime.current);
    };
  }, [slug, updateTimeOnPage]);

  // ── Inactivity tracking ──────────────────────────────────
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        fireSignal("inactivity");
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [fireSignal]);

  // ── Repeated visit tracking ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(REPEATED_VISIT_KEY) ?? "{}";
      const visits: Record<string, number> = JSON.parse(raw);
      const count = (visits[slug] ?? 0) + 1;
      visits[slug] = count;
      sessionStorage.setItem(REPEATED_VISIT_KEY, JSON.stringify(visits));

      if (count > 1) {
        fireSignal("repeated_visit");
        incrementEngagement(10);
      }
    } catch {
      // SessionStorage not available — ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Reset on page change ─────────────────────────────────
  useEffect(() => {
    deepScrollFired.current = false;
    lastScrollDepth.current = 0;
  }, [slug]);
}

