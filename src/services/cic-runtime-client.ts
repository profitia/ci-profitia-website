// ─────────────────────────────────────────────────────────
// CIC Runtime Client
// Typed fetch client for all CIC Runtime API endpoints.
// Used from React components, hooks, and Zustand store.
// ─────────────────────────────────────────────────────────

import type {
  OrchestrationRequest,
  OrchestrationResponse,
} from "@/runtime/schemas/orchestration.schema";
import type {
  RecommendationRequest,
  RecommendationResponse,
} from "@/runtime/schemas/recommendation.schema";
import type {
  SessionRuntimeRequest,
  SessionRuntimeResponse,
} from "@/runtime/schemas/session.schema";
import type {
  ExperimentRequest,
  ExperimentResponse,
} from "@/runtime/schemas/experiment.schema";
import type { PersonalizeRequest, PersonalizeResponse } from "@/runtime/schemas/deployment.schema";
import {
  decodeRuntimeEvent,
  type RuntimeEvent,
} from "@/runtime/schemas/runtime-event.schema";

// ── Base fetch helper ────────────────────────────────────
async function runtimeFetch<TIn, TOut>(
  path: string,
  body: TIn,
  baseUrl: string
): Promise<TOut> {
  const url = `${baseUrl}/api/runtime${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `CIC Runtime ${path} failed (${res.status}): ${JSON.stringify(errorBody)}`
    );
  }

  return res.json() as Promise<TOut>;
}

// ── CIC Runtime Client class ─────────────────────────────
export class CICRuntimeClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /** POST /api/runtime/orchestrate — master intelligence orchestration */
  async orchestrate(
    request: OrchestrationRequest
  ): Promise<OrchestrationResponse> {
    return runtimeFetch<OrchestrationRequest, OrchestrationResponse>(
      "/orchestrate",
      request,
      this.baseUrl
    );
  }

  /** POST /api/runtime/recommend — server-side recommendation engine */
  async recommend(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    return runtimeFetch<RecommendationRequest, RecommendationResponse>(
      "/recommend",
      request,
      this.baseUrl
    );
  }

  /** POST /api/runtime/session — session event processing + proactive triggers */
  async session(
    request: SessionRuntimeRequest
  ): Promise<SessionRuntimeResponse> {
    return runtimeFetch<SessionRuntimeRequest, SessionRuntimeResponse>(
      "/session",
      request,
      this.baseUrl
    );
  }

  /** POST /api/runtime/personalize — per-request personalization decisions */
  async personalize(
    request: PersonalizeRequest
  ): Promise<PersonalizeResponse> {
    return runtimeFetch<PersonalizeRequest, PersonalizeResponse>(
      "/personalize",
      request,
      this.baseUrl
    );
  }

  /** POST /api/runtime/experiment — experiment variant allocation */
  async experiment(
    request: ExperimentRequest
  ): Promise<ExperimentResponse> {
    return runtimeFetch<ExperimentRequest, ExperimentResponse>(
      "/experiment",
      request,
      this.baseUrl
    );
  }

  /** POST /api/runtime/stream — SSE streaming with structured RuntimeEvents */
  async *streamAdvisory(
    request: OrchestrationRequest
  ): AsyncGenerator<RuntimeEvent> {
    const url = `${this.baseUrl}/api/runtime/stream`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok || !res.body) {
      throw new Error(`CIC Runtime stream failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on double newlines (SSE message boundary)
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const chunk of lines) {
        for (const line of chunk.split("\n")) {
          const event = decodeRuntimeEvent(line);
          if (event) {
            yield event;
            if (event.type === "done" || event.type === "error") return;
          }
        }
      }
    }
  }

  /** GET /api/runtime/health — runtime health check */
  async health(): Promise<{ status: string; version: string }> {
    const url = `${this.baseUrl}/api/runtime/health`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CIC health check failed (${res.status})`);
    return res.json();
  }
}

// ── Singleton instance ────────────────────────────────────
// When running inside Next.js, NEXT_PUBLIC_RUNTIME_URL defaults
// to the same origin (empty string → relative paths resolve correctly).
export const cicRuntimeClient = new CICRuntimeClient(
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_RUNTIME_URL ?? "")
    : ""
);
