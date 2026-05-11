"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAdvisorySession } from "@/stores/advisory-session.store";
import { ASSISTANT_STRINGS } from "@/lib/i18n";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { RecommendationStrip } from "./RecommendationStrip";
import type { Locale } from "@/lib/i18n";
import type { Message } from "@/types";

interface AssistantPanelProps {
  locale: Locale;
}

// Phase label for header
const PHASE_LABELS: Record<string, { pl: string; en: string }> = {
  idle: { pl: "Gotowy do rozmowy", en: "Ready to advise" },
  opening: { pl: "Słucham...", en: "Listening..." },
  intent_discovery: { pl: "Diagnozuję sytuację", en: "Understanding your situation" },
  problem_framing: { pl: "Precyzuję problem", en: "Framing the challenge" },
  capability_recommendation: { pl: "Rekomendacja gotowa", en: "Recommendation ready" },
  objection_handling: { pl: "Omawiam wątpliwości", en: "Addressing concerns" },
  escalation: { pl: "Gotowy do rozmowy z ekspertem", en: "Ready for expert conversation" },
  post_escalation: { pl: "Do usłyszenia wkrótce", en: "Talk soon" },
};

export function AssistantPanel({ locale }: AssistantPanelProps) {
  const {
    session,
    lastDecision,
    closeAssistant,
    addMessage,
    setTyping,
    setStreaming,
    updateIntent,
    updateUrgency,
    setPhase,
    incrementEngagement,
    runOrchestration,
  } = useAdvisorySession();

  const strings = ASSISTANT_STRINGS[locale];
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Send message to advisory API
  const handleSend = useCallback(
    async (content: string) => {
      if (!session || !content.trim()) return;

      // Add user message
      addMessage("user", content);
      incrementEngagement(5);
      setTyping(true);
      setStreamingContent("");

      // Abort previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Run orchestration before sending to get fresh decision
      const freshDecision = runOrchestration();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...session.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: "user", content },
            ],
            locale,
            pageContext: session.pageContext,
            sessionState: session.state,
            advisoryDecision: freshDecision ?? lastDecision,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error("API error");

        setTyping(false);
        setStreaming(true);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "text") {
                    accumulated += parsed.content;
                    setStreamingContent(accumulated);
                  } else if (parsed.type === "metadata") {
                    if (parsed.intent) updateIntent(parsed.intent, parsed.confidence ?? 0.7);
                    if (parsed.urgency) updateUrgency(parsed.urgency);
                    if (parsed.phase) setPhase(parsed.phase);
                  }
                } catch {
                  // Not JSON — ignore
                }
              }
            }
          }
        }

        if (accumulated) {
          addMessage("assistant", accumulated);
          setStreamingContent("");
          incrementEngagement(10);
          // Re-run orchestration after getting response
          setTimeout(() => runOrchestration(), 100);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setTyping(false);
          addMessage("assistant", strings.errorMessage);
        }
      } finally {
        setTyping(false);
        setStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, locale, addMessage, setTyping, setStreaming, updateIntent, updateUrgency, setPhase, incrementEngagement, strings, lastDecision]
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const phase = session?.state.phase ?? "idle";
  const phaseLabel = PHASE_LABELS[phase]?.[locale] ?? PHASE_LABELS.idle[locale];

  // Use orchestrator decision for recommendation visibility
  const showRecommendations =
    session &&
    lastDecision?.recommendations.shouldShow &&
    session.intelligence.recommendationsShown.length === 0;

  // Urgency indicator color
  const urgencyColor =
    session?.state.urgency === "U1"
      ? "bg-red-400"
      : session?.state.urgency === "U2"
      ? "bg-amber-400"
      : "bg-green-400";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#242F44] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" fill="white" />
              <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">
              Profitia Advisory
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {session?.state.urgency && session.state.intentConfidence > 0.4 && (
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyColor}`} />
              )}
              <p className="text-2xs text-gray-400 leading-none">
                {phaseLabel}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={closeAssistant}
          aria-label={strings.closeAriaLabel}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Message list */}
      <MessageList
        messages={session?.messages ?? []}
        streamingContent={streamingContent}
        locale={locale}
      />

      {/* Recommendation strip — orchestrator-driven */}
      {showRecommendations && (
        <RecommendationStrip
          intent={session.state.detectedIntent}
          urgency={session.state.urgency}
          confidence={session.state.intentConfidence}
          shownIds={session.intelligence.recommendationsShown}
          locale={locale}
        />
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        placeholder={strings.placeholder}
        disabled={false}
      />
    </div>
  );
}

