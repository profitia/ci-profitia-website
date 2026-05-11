// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Conversation Runner
// Executes a single advisory scenario against the live API.
// Collects the full transcript turn by turn.
// ─────────────────────────────────────────────────────────

import type {
  AdvisoryScenario,
  ConversationTranscript,
  TurnRecord,
  APICallResult,
  ChatAPIPayload,
  AdvisoryMetadata,
  RunOptions,
} from "../types/index";
import { nanoid } from "./nanoid-compat";

// ── SSE Stream Parser ─────────────────────────────────────

async function parseSSEStream(
  body: ReadableStream<Uint8Array>
): Promise<{ text: string; metadata: AdvisoryMetadata | null }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let metadata: AdvisoryMetadata | null = null;
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") continue;

      try {
        const event = JSON.parse(raw) as Record<string, unknown>;
        if (event.type === "text") {
          text += (event.content as string) ?? "";
        } else if (event.type === "metadata") {
          metadata = {
            intent: event.intent as string | undefined,
            confidence: event.confidence as number | undefined,
            urgency: event.urgency as string | undefined,
            phase: event.phase as string | undefined,
          };
        }
      } catch {
        // Ignore unparseable lines
      }
    }
  }

  return { text, metadata };
}

// ── Single API call ───────────────────────────────────────

export async function callChatAPI(
  baseUrl: string,
  payload: ChatAPIPayload
): Promise<APICallResult> {
  const start = Date.now();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    return {
      text: "",
      metadata: null,
      durationMs: Date.now() - start,
      error: `Fetch failed: ${String(err)}`,
    };
  }

  if (!response.ok) {
    return {
      text: "",
      metadata: null,
      durationMs: Date.now() - start,
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  if (!response.body) {
    return {
      text: "",
      metadata: null,
      durationMs: Date.now() - start,
      error: "No response body",
    };
  }

  try {
    const { text, metadata } = await parseSSEStream(response.body);
    return { text, metadata, durationMs: Date.now() - start };
  } catch (err) {
    return {
      text: "",
      metadata: null,
      durationMs: Date.now() - start,
      error: `Stream parse error: ${String(err)}`,
    };
  }
}

// ── Helpers ───────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countBullets(text: string): number {
  return (text.match(/^[-*•]\s/gm) ?? []).length + (text.match(/^\d+\.\s/gm) ?? []).length;
}

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main conversation runner ──────────────────────────────

export async function runConversation(
  scenario: AdvisoryScenario,
  options: Pick<RunOptions, "baseUrl" | "delayBetweenCallsMs" | "verbose">
): Promise<ConversationTranscript> {
  const sessionId = nanoid();
  const startedAt = new Date().toISOString();
  const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  const turns: TurnRecord[] = [];
  let runError: string | undefined;

  if (options.verbose) {
    console.log(`\n[${scenario.id}] ${scenario.title} (${scenario.locale})`);
  }

  for (let turnIndex = 0; turnIndex < scenario.turns.length; turnIndex++) {
    const turn = scenario.turns[turnIndex];

    // Add user message to conversation history
    conversationMessages.push({ role: "user", content: turn.user });

    if (options.verbose) {
      process.stdout.write(`  Turn ${turnIndex + 1}/${scenario.turns.length}: `);
    }

    const locale: "pl" | "en" =
      scenario.locale === "mixed"
        ? detectDominantLocale(turn.user)
        : scenario.locale;

    const payload: ChatAPIPayload = {
      messages: [...conversationMessages],
      locale,
      pageContext: scenario.pageContext,
      sessionState: scenario.sessionState,
    };

    const result = await callChatAPI(options.baseUrl, payload);

    if (result.error) {
      runError = result.error;
      if (options.verbose) {
        console.log(`ERROR: ${result.error}`);
      }
      break;
    }

    // Add assistant response to history
    conversationMessages.push({ role: "assistant", content: result.text });

    const turnRecord: TurnRecord = {
      turnIndex,
      userMessage: turn.user,
      assistantResponse: result.text,
      assistantMetadata: result.metadata,
      durationMs: result.durationMs,
      wordCount: countWords(result.text),
      bulletCount: countBullets(result.text),
      questionCount: countQuestions(result.text),
      flags: [],
      // Populated by evaluator later
      turnScore: {
        procurementQuality: 0,
        negotiationQuality: 0,
        communicationQuality: 0,
        advisorySharpness: 0,
        escalationTimeliness: 0,
        injectionResistance: 0,
        realism: 0,
        composite: 0,
      },
    };

    turns.push(turnRecord);

    if (options.verbose) {
      const wordCount = turnRecord.wordCount;
      const timing = `${result.durationMs}ms`;
      console.log(`${wordCount} words, ${timing}`);
    }

    // Throttle between turns
    if (turnIndex < scenario.turns.length - 1) {
      await sleep(options.delayBetweenCallsMs);
    }
  }

  const completedAt = new Date().toISOString();

  // Placeholder evaluation — filled by composite evaluator
  const emptyEvaluation = buildEmptyEvaluation(scenario.id);

  const transcript: ConversationTranscript = {
    scenarioId: scenario.id,
    scenario,
    sessionId,
    startedAt,
    completedAt,
    totalDurationMs: turns.reduce((sum, t) => sum + t.durationMs, 0),
    turns,
    evaluation: emptyEvaluation,
    runError,
  };

  return transcript;
}

// ── Locale detection ──────────────────────────────────────

function detectDominantLocale(text: string): "pl" | "en" {
  // Simple heuristic: PL-specific characters or common PL words
  const plSignals = (text.match(/[ąćęłńóśźż]/gi) ?? []).length;
  const plWords = (text.match(/\b(jest|nie|jak|mamy|nasz|dostawca|zakup|cena)\b/gi) ?? []).length;
  return plSignals + plWords >= 2 ? "pl" : "en";
}

// ── Empty evaluation placeholder ──────────────────────────

function buildEmptyEvaluation(scenarioId: string) {
  return {
    scenarioId,
    overallScore: 0,
    procurementIntelligence: 0,
    negotiationIntelligence: 0,
    executiveAdvisory: 0,
    escalationQuality: 0,
    uxQuality: 0,
    realism: 0,
    multilingualQuality: 0,
    securityQuality: 0,
    hallucinations: 0,
    aiToneScore: 0,
    verbosityScore: 0,
    advisorySharpness: 0,
    procurementRealism: 0,
    executiveRealism: 0,
    escalationTiming: 0,
    recommendationQuality: 0,
    injectionResistance: 0,
    diagnosticQuestionQuality: 0,
    redFlags: [],
    totalRedFlags: 0,
    criticalRedFlags: 0,
    criticalFindings: [],
    strengths: [],
    recommendations: [],
  };
}
