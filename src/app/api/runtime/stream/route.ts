// ─────────────────────────────────────────────────────────
// CIC Runtime API — POST /api/runtime/stream
// Enhanced SSE streaming endpoint. Uses CIC runtime to build
// system prompts and emits structured RuntimeEvents alongside
// token stream.
// ─────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { parseAdvisoryMetadata } from "@/runtime/schemas/advisory-output.schema";
import {
  encodeRuntimeEvent,
  type RuntimeEvent,
} from "@/runtime/schemas/runtime-event.schema";
import { runOrchestrationRuntime } from "@/runtime/engines/orchestration-runtime";
import { runRecommendationRuntime } from "@/runtime/engines/recommendation-runtime";
import { computePersonalization } from "@/runtime/engines/personalization-runtime";
import {
  buildRuntimeSystemPrompt,
  emitOrchestrationEvent,
  emitPersonalizationEvent,
  emitRecommendationEvents,
  emitEscalationEvent,
} from "@/runtime/engines/streaming-runtime";
import { getDeploymentConfig } from "@/runtime/deployment/deployment-registry";
import { OrchestrationRequestSchema } from "@/runtime/schemas/orchestration.schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Request schema (stream-specific, extends orchestration) ──
const StreamRequestSchema = OrchestrationRequestSchema.extend({
  // Additional per-request streaming options
  maxTokens: z.number().int().min(100).max(1500).optional(),
  temperature: z.number().min(0).max(1).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      encodeRuntimeEvent({ type: "error", message: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const parsed = StreamRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      encodeRuntimeEvent({ type: "error", message: "Validation failed" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const { maxTokens, temperature, ...orchestrationData } = parsed.data;
  const { sessionId, locale, deploymentId } = orchestrationData;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const emit = (event: RuntimeEvent) => {
        controller.enqueue(encoder.encode(encodeRuntimeEvent(event)));
      };

      try {
        // 1. Run orchestration engine
        const orchestration = runOrchestrationRuntime(orchestrationData);
        emit(emitOrchestrationEvent(orchestration));

        // 2. Run personalization
        const personalizationRequest = {
          sessionId,
          locale: locale as "pl" | "en",
          deploymentId,
          signals: {
            maturityPersona: orchestration.maturity.persona,
            maturityScore: orchestration.maturity.score,
            intent: orchestration.intent.primary,
            intentConfidence: orchestration.intent.primaryConfidence,
            urgency: orchestration.intent.urgency,
            buyingStage: orchestrationData.sessionState.buyingStage,
            engagementScore: orchestrationData.sessionState.engagementScore,
            messagesCount: orchestrationData.messages.length,
            pagesVisited: orchestrationData.intelligence.pagesVisited,
            workshopProbability: orchestration.intent.workshopProbability,
          },
        };
        const personalization = computePersonalization(personalizationRequest);
        emit(emitPersonalizationEvent(personalization));

        // 3. Build runtime system prompt
        const deployment = getDeploymentConfig(deploymentId);
        const systemPrompt = buildRuntimeSystemPrompt(
          locale as "pl" | "en",
          orchestration,
          personalization,
          deployment.description
        );

        // 4. Stream LLM completion
        const completion = await openai.chat.completions.create({
          model: deployment.llm.model,
          messages: [
            { role: "system", content: systemPrompt },
            ...orchestrationData.messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ],
          stream: true,
          max_tokens: maxTokens ?? deployment.llm.maxTokens,
          temperature: temperature ?? deployment.llm.temperature,
        });

        let fullContent = "";
        let metadataStarted = false;
        let visibleBufferFlushed = false;

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (!delta) continue;

          fullContent += delta;

          if (metadataStarted) continue;

          // Detect metadata block start → stop streaming tokens
          const metaIndex = fullContent.indexOf("```metadata");
          if (metaIndex !== -1) {
            metadataStarted = true;
            if (!visibleBufferFlushed) {
              visibleBufferFlushed = true;
            }
            continue;
          }

          emit({ type: "token", content: delta });
          visibleBufferFlushed = true;
        }

        // 5. Parse advisory metadata from full content
        const advisoryMetadata = parseAdvisoryMetadata(fullContent);
        if (advisoryMetadata) {
          emit({
            type: "advisory_metadata",
            intent: advisoryMetadata.intent,
            confidence: advisoryMetadata.confidence,
            urgency: advisoryMetadata.urgency,
            phase: advisoryMetadata.phase,
            buyingStage: advisoryMetadata.buyingStage,
          });

          // Emit advisory reasoning if available
          if (
            advisoryMetadata.workshopProbability !== undefined ||
            advisoryMetadata.discoveryReadiness !== undefined ||
            advisoryMetadata.nextBestAction !== undefined
          ) {
            emit({
              type: "advisory_reasoning",
              workshopProbability: advisoryMetadata.workshopProbability,
              discoveryReadiness: advisoryMetadata.discoveryReadiness,
              nextBestAction: advisoryMetadata.nextBestAction,
              maturitySignal: advisoryMetadata.maturitySignals?.[0],
              capabilityRecommendations:
                advisoryMetadata.capabilityRecommendations,
            });
          }
        }

        // 6. Run recommendation engine and emit results
        const recRequest = {
          sessionId,
          locale: locale as "pl" | "en",
          deploymentId,
          context: {
            intent: advisoryMetadata?.intent ?? orchestration.intent.primary,
            intentConfidence:
              advisoryMetadata?.confidence ??
              orchestration.intent.primaryConfidence,
            urgency: (advisoryMetadata?.urgency ??
              orchestration.intent.urgency) as "U1" | "U2" | "U3",
            maturityPersona: orchestration.maturity.persona,
            maturityScore: orchestration.maturity.score,
            buyingStage: orchestrationData.sessionState
              .buyingStage as "S1" | "S2" | "S3" | "S4",
            pageSlug: orchestrationData.pageSlug,
            pagesVisited: orchestrationData.intelligence.pagesVisited,
            engagementScore: orchestrationData.sessionState.engagementScore,
            ctaFatigue: orchestrationData.sessionState.ctaFatigue,
            messagesCount: orchestrationData.messages.length,
            executiveRole: orchestration.personalization.executiveRole,
          },
          history: {
            recommendationsShown:
              orchestrationData.intelligence.recommendationsShown,
            ctasShown: orchestrationData.intelligence.ctasShown,
            ctaClicked: orchestrationData.intelligence.ctaClicked,
          },
        };
        const recommendations = runRecommendationRuntime(recRequest);
        const recEvents = emitRecommendationEvents(recommendations);
        for (const event of recEvents) {
          emit(event);
        }

        // 7. Emit escalation if needed
        const escalationEvent = emitEscalationEvent(orchestration);
        if (escalationEvent) emit(escalationEvent);

        emit({ type: "done" });
      } catch (err) {
        console.error("[runtime/stream] Streaming error:", err);
        emit({
          type: "error",
          message: "Advisory service temporarily unavailable",
          code: "STREAM_ERROR",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
