// ─────────────────────────────────────────────────────────
// CIC Runtime API — GET /api/runtime/health
// Health check endpoint for the CIC runtime.
// Returns runtime status, version, and deployment info.
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAllDeployments, listDeploymentIds } from "@/runtime/deployment/deployment-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const deployments = getAllDeployments();

  return NextResponse.json({
    status: "healthy",
    runtime: "cic-advisory-runtime",
    version: "4.0.0",
    timestamp: Date.now(),
    deployments: {
      total: deployments.length,
      ids: listDeploymentIds(),
      active: deployments.filter((d) => d.environment === "production").length,
    },
    capabilities: {
      orchestration: true,
      streaming: true,
      recommendations: true,
      personalization: true,
      experimentation: true,
      sessionIntelligence: true,
      procurementIntelligence: true,
      multilingual: true,
    },
    engines: {
      orchestration: "v4",
      recommendation: "v4",
      session: "v4",
      personalization: "v4",
      optimization: "v4",
      experimentation: "v4",
      procurementIntelligence: "v4",
      multilingual: "v4",
      streaming: "v4",
    },
  });
}
