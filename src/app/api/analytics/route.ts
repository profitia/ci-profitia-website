import { NextRequest, NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events } = body as { events: AnalyticsEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: true });
    }

    // Structured log for observability
    if (process.env.NODE_ENV === "production") {
      for (const event of events) {
        console.log(
          JSON.stringify({
            level: "info",
            service: "ci-profitia-analytics",
            ...event,
          })
        );
      }
    }

    // Future: forward to PostHog, Segment, Mixpanel, or custom warehouse
    // await forwardToAnalyticsProvider(events);

    return NextResponse.json({ ok: true, received: events.length });
  } catch {
    // Analytics failures must be silent — never break the UX
    return NextResponse.json({ ok: true });
  }
}
