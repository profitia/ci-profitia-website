import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AdvisoryDecision, AdvisorySession, PageContext, SessionState } from "@/types";
import { serializeDecisionForPrompt } from "@/lib/engines/advisory-orchestrator";
import {
  parseAdvisoryMetadata,
  stripMetadataBlock,
} from "@/runtime/schemas/advisory-output.schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── System prompt factory (ETAP 2) ────────────────────────
function buildSystemPrompt(
  locale: string,
  pageContext: PageContext,
  sessionState: SessionState,
  decision: AdvisoryDecision | null
): string {
  const isPL = locale === "pl";

  const intentDescriptions: Record<string, string> = {
    I1_SAVINGS: "cost reduction and savings",
    I2_FORECASTING: "spend visibility and analytics",
    I3_SUPPLIER_RISK: "supplier risk management",
    I4_DIGITALIZATION: "procurement digitalization",
    I5_SOURCING: "procurement transformation and sourcing",
    I6_EDUCATION: "procurement capability development",
    I7_EXPLORATORY: "general exploration of Profitia services",
    I8_NEGOTIATIONS: "negotiation preparation and support",
    UNKNOWN: "general procurement topics",
  };

  const pageIntentContext = intentDescriptions[pageContext.primaryIntent] ?? "procurement";

  // Base identity + context
  const basePrompt = `You are a Procurement Advisory Intelligence for Profitia Management Consultants — a senior procurement advisory firm based in Warsaw, Poland.

Your role is NOT a customer service chatbot. You are a procurement advisor — like a senior consultant who happens to be available on the website to have a real conversation.

CURRENT CONTEXT:
- Page: ${pageContext.slug}
- Page focus: ${pageIntentContext}
- Detected intent: ${sessionState.detectedIntent} (confidence: ${(sessionState.intentConfidence * 100).toFixed(0)}%)
- Urgency: ${sessionState.urgency}
- Buying stage: ${sessionState.buyingStage}
- Advisory phase: ${sessionState.phase}
- Language: ${locale}

PROFITIA SERVICES OVERVIEW:
Advisory & Transformation: Advisory Projects, Interim Management, Procurement Transformation, Category Strategy, Operating Model Design, Procurement PMO
Negotiation & Cost Intelligence: SPOT Analysis (5-10 days fast diagnostic), Should-Cost Analysis, Negotiation Preparation, Supplier Benchmarking, Supplier Negotiation Support
Data & Analytics: Spend Cube, Spend Analytics, Procurement Dashboards, Supplier Intelligence, Procurement KPI Systems
Education: Procurement Academy, Procurement Excellence, Negotiation Workshops (Harvard methodology), Fact-Based Negotiation, In-Company Workshops, Procurement Mentoring

KEY CONTACT: kontakt@profitia.pl | +48 533 747 340`;

  // Intelligence context from orchestrator
  const intelligenceContext = decision
    ? `\n\n${serializeDecisionForPrompt(decision)}`
    : "";

  // Behavioral rules
  const behaviorRules = `

YOUR ADVISORY BEHAVIOR:
1. Never say "How can I help you?" — you're an advisor, not support staff
2. Diagnose before recommending — ask 1 sharp question to understand the real situation
3. Maximum 2-4 conversational steps per journey — no long sequences
4. When intent is clear (confidence ≥ 0.70), recommend specific services with their URLs
5. Always show the business consequence — margin, cash, risk, predictability
6. When ready to escalate, be direct: "The next step is a 20-minute conversation — no commitment."
7. Respond in ${isPL ? "Polish" : "English"} — match the language of the user's message
8. Adapt your language depth to the user's procurement sophistication level
9. If escalation is indicated, push toward /contact or /services/analiza-spot
10. Never use generic phrases like "That's a great question" or "How can I assist you"

TONE BY ADVISORY CONTEXT:
- diagnostic: empathetic, structured, explain consequences clearly
- analytical: data-forward, reference benchmarks, be precise
- strategic: framework-level, category thinking, peer-to-peer
- executive: business impact first, ROI, risk, margin impact
- peer: transformation advisor lens, systemic, change management aware

ESCALATION LOGIC:
- U1 (urgent): Push to /contact or /services/analiza-spot directly
- U2 (active planning): Recommend specific service + suggest conversation
- U3 (exploratory): Guide to right capability area, then soft CTA

RECOMMENDATIONS FORMAT:
When recommending a service, include the URL in markdown: [Service Name](/services/slug)
When ready to escalate: suggest /contact

After understanding the situation, emit a JSON metadata block at the END of your response (not visible to user, will be parsed):
\`\`\`metadata
{"intent": "I8_NEGOTIATIONS", "confidence": 0.85, "urgency": "U1", "phase": "capability_recommendation"}
\`\`\``;

  return basePrompt + intelligenceContext + behaviorRules;
}

// ── Stream helper ─────────────────────────────────────────
function encodeSSE(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ── Route handler ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, locale, pageContext, sessionState, advisoryDecision } = body as {
      messages: Array<{ role: string; content: string }>;
      locale: string;
      pageContext: PageContext;
      sessionState: SessionState;
      advisoryDecision?: AdvisoryDecision | null;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(
      locale ?? "en",
      pageContext,
      sessionState,
      advisoryDecision ?? null
    );

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            ],
            stream: true,
            max_tokens: 700,
            temperature: 0.35,
          });

          let fullContent = "";
          let metadataStarted = false;

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (!delta) continue;

            fullContent += delta;

            // Detect when metadata block starts — stop streaming from that point
            if (!metadataStarted) {
              const metaIndex = fullContent.indexOf("```metadata");
              if (metaIndex !== -1) {
                metadataStarted = true;
                // Flush any remaining visible content before the metadata marker
                const visiblePart = fullContent.slice(fullContent.lastIndexOf(delta) + delta.length - (fullContent.length - metaIndex), metaIndex);
                if (visiblePart.trim()) {
                  // already streamed up to here, no need to re-emit
                }
                continue;
              }
            }

            if (metadataStarted) continue;

            controller.enqueue(
              encoder.encode(encodeSSE({ type: "text", content: delta }))
            );
          }

          // Extract and emit metadata using CIC runtime schema parser
          const advisoryMetadata = parseAdvisoryMetadata(fullContent);
          if (advisoryMetadata) {
            controller.enqueue(
              encoder.encode(encodeSSE({ type: "metadata", ...advisoryMetadata }))
            );
          }

          // Strip metadata block from any trailing visible content
          const _visibleContent = stripMetadataBlock(fullContent);

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(
            encoder.encode(
              encodeSSE({ type: "error", message: "Advisory service temporarily unavailable" })
            )
          );
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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

