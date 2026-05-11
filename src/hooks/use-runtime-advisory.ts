// ─────────────────────────────────────────────────────────
// CIC Runtime — React Hooks
// Typed React hooks consuming the CIC Runtime Client.
// Used by AdaptivePage and advisory components.
// ─────────────────────────────────────────────────────────

"use client";

import { useCallback, useRef, useState } from "react";
import { cicRuntimeClient } from "@/services/cic-runtime-client";
import { useAdvisoryStore } from "@/stores/advisory-session.store";
import type { RuntimeEvent } from "@/runtime/schemas/runtime-event.schema";
import type { OrchestrationResponse } from "@/runtime/schemas/orchestration.schema";
import type { RecommendationResponse } from "@/runtime/schemas/recommendation.schema";
import type { SessionRuntimeResponse } from "@/runtime/schemas/session.schema";

// ── useRuntimeStream ─────────────────────────────────────
/**
 * Streams a response from the CIC runtime stream endpoint.
 * Emits typed RuntimeEvents: token, advisory_metadata, recommendation, cta, etc.
 */
export function useRuntimeStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (
      request: Parameters<typeof cicRuntimeClient.streamAdvisory>[0],
      onEvent: (event: RuntimeEvent) => void
    ) => {
      if (isStreaming) return;

      abortRef.current = new AbortController();
      setIsStreaming(true);
      setError(null);

      try {
        for await (const event of cicRuntimeClient.streamAdvisory(request)) {
          onEvent(event);
          if (event.type === "done" || event.type === "error") break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        setError(message);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { stream, isStreaming, error, abort };
}

// ── useRuntimeOrchestration ──────────────────────────────
/**
 * Calls the remote orchestration endpoint. Returns the full
 * OrchestrationResponse and exposes loading/error state.
 */
export function useRuntimeOrchestration() {
  const [result, setResult] = useState<OrchestrationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orchestrate = useCallback(
    async (
      request: Parameters<typeof cicRuntimeClient.orchestrate>[0]
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await cicRuntimeClient.orchestrate(request);
        setResult(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Orchestration failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { orchestrate, result, loading, error };
}

// ── useRuntimeRecommendations ────────────────────────────
/**
 * Fetches server-side recommendations from /api/runtime/recommend.
 */
export function useRuntimeRecommendations() {
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommend = useCallback(
    async (
      request: Parameters<typeof cicRuntimeClient.recommend>[0]
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await cicRuntimeClient.recommend(request);
        setResult(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Recommendation failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { recommend, result, loading, error };
}

// ── useSessionRuntime ────────────────────────────────────
/**
 * Posts a session event to /api/runtime/session and processes insights.
 * Automatically triggers re-orchestration if the runtime recommends it.
 */
export function useSessionRuntime() {
  const [lastInsights, setLastInsights] =
    useState<SessionRuntimeResponse["insights"] | null>(null);

  const processEvent = useCallback(
    async (
      request: Parameters<typeof cicRuntimeClient.session>[0]
    ) => {
      try {
        const response = await cicRuntimeClient.session(request);
        setLastInsights(response.insights);
        return response;
      } catch {
        return null;
      }
    },
    []
  );

  return { processEvent, lastInsights };
}

// ── useAdvisoryRuntime ───────────────────────────────────
/**
 * Convenience hook that binds the Zustand store's remote
 * orchestration action and exposes combined state.
 */
export function useAdvisoryRuntime() {
  const store = useAdvisoryStore();

  return {
    // Store state
    session: store.session,
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,

    // Remote orchestration
    runRemoteOrchestration: store.runRemoteOrchestration,
    lastOrchestrationResponse: store.lastOrchestrationResponse,

    // Local orchestration (ETAP 3 fallback)
    lastDecision: store.lastDecision,
    lastETAP3Decision: store.lastETAP3Decision,

    // Session init
    initSession: store.initSession,
  };
}
