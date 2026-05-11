// ─────────────────────────────────────────────────────────
// CIC — Context Layer Type System
//
// Domain Cognition Architecture — ETAP 6
// Context layers are reasoning artifacts, NOT documentation.
// They encode: advisory logic, negotiation intelligence,
// escalation patterns, executive framing, procurement psychology,
// capability grounding and domain-specific heuristics.
//
// NEVER treat these as a CMS or RAG knowledge base.
// They are REASONING CONTEXT LAYERS for the advisory runtime.
// ─────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────

export type DeploymentId = "ci-profitia" | "spendguru" | "all";
export type LocaleScope = "pl" | "en" | "all";
export type UrgencyLevel = "U1" | "U2" | "U3";
export type MaturityLevel = "reactive" | "developing" | "strategic";
export type ExecutiveRole =
  | "CFO"
  | "CPO"
  | "CEO"
  | "procurement_manager"
  | "category_manager"
  | "all";

export type IntentCode =
  | "I1_SAVINGS"
  | "I2_FORECASTING"
  | "I3_SUPPLIER_RISK"
  | "I4_DIGITALIZATION"
  | "I5_SOURCING"
  | "I6_EDUCATION"
  | "I7_ADVISORY"
  | "I8_NEGOTIATIONS"
  | "UNKNOWN";

export type ContextLayerDomain =
  | "procurement"
  | "negotiation"
  | "category"
  | "education"
  | "transformation"
  | "executive_advisory"
  | "sourcing"
  | "spendguru";

// ── Activation Condition ──────────────────────────────────
// Determines when a rule, heuristic or layer fires.
// Empty array = matches all. Omitted field = unconstrained.

export interface ContextActivationCondition {
  intentMatches?: IntentCode[];
  urgencyLevels?: UrgencyLevel[];
  maturityLevels?: MaturityLevel[];
  executiveRoles?: ExecutiveRole[];
  deployments?: DeploymentId[];
  locales?: LocaleScope[];
}

// ── Reasoning Rule ────────────────────────────────────────
// Core advisory heuristic that fires when its condition matches.
// systemPromptSnippet is injected verbatim into the system prompt.

export interface ReasoningRule {
  id: string;
  label: string;                      // human-readable identifier for this rule
  condition: ContextActivationCondition;
  heuristic: string;                  // internal advisory principle
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
  priority: number;                   // higher = injected first, wins conflicts
}

// ── Negotiation Intelligence ──────────────────────────────
// Encodes negotiation reasoning patterns, leverage identification
// and should-cost awareness.

export interface NegotiationHeuristic {
  id: string;
  scenario: string;                   // when this pattern applies
  leveragePoint: string;              // what leverage is available
  applicableIntents: IntentCode[];    // empty = all
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Should-Cost Intelligence ──────────────────────────────

export interface ShouldCostEntry {
  id: string;
  useCase: string;
  costDriverFocus: string;
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Escalation Rule ───────────────────────────────────────
// Encodes WHEN to educate vs. escalate and HOW.

export type EscalationForm =
  | "discovery_call"
  | "workshop"
  | "diagnostic_session"
  | "direct_cta"
  | "educate_first"
  | "none";

export interface EscalationRule {
  id: string;
  condition: ContextActivationCondition;
  escalationForm: EscalationForm;
  reasoning: string;
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Executive Framing ─────────────────────────────────────
// Role-specific KPIs and framing logic.

export interface ExecutiveFramingEntry {
  role: ExecutiveRole;
  kpis: string[];
  framingPrinciple: string;           // how to frame value for this role
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Procurement Psychology ────────────────────────────────
// Behavioral patterns and how to respond to them.

export interface PsychologyEntry {
  id: string;
  pattern: string;                    // observed behavior pattern
  underlyingNeed: string;             // what the user actually needs
  advisoryResponse: string;           // how the advisor should respond
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Capability Grounding ──────────────────────────────────
// Maps product capabilities to specific business problems.
// Prevents marketing-first recommendations.

export interface CapabilityGroundingEntry {
  capabilityId: string;
  capabilityName: string;
  businessProblems: string[];         // problems this capability solves
  triggerIntents: IntentCode[];       // which intents activate this capability
  triggerUrgency: UrgencyLevel[];     // which urgency levels are relevant
  systemPromptSnippet: {
    pl: string;
    en: string;
  };
}

// ── Category Intelligence ─────────────────────────────────
// Future: per-category cost driver and negotiation logic.

export interface CategoryIntelligenceEntry {
  category: string;
  costDrivers: string[];
  volatilityLogic: string;
  negotiationPatterns: string[];
  benchmarkLogic: string;
  status: "initial" | "developed" | "expert";
}

// ── Context Layer Versioning ──────────────────────────────

export interface ContextLayerVersion {
  version: string;                    // semver: major.minor.patch
  publishedAt: string;                // ISO 8601
  breakingChange: boolean;
  changelog: string;
  author: string;
}

// ── Full Context Layer Definition ─────────────────────────
// The top-level artifact. One file = one ContextLayer.

export interface ContextLayer {
  // Identity
  id: string;
  name: string;
  description: string;
  domain: ContextLayerDomain;
  version: ContextLayerVersion;

  // Scope
  deployments: DeploymentId[];        // which deployments this layer applies to
  locales: LocaleScope[];             // which locales
  priority: number;                   // 0-100; higher wins in merge conflicts

  // Default activation (layer-level gate)
  defaultActivation: ContextActivationCondition;

  // Cognition artifacts
  advisoryLogic: ReasoningRule[];
  negotiationLogic: NegotiationHeuristic[];
  shouldCostLogic: ShouldCostEntry[];
  escalationLogic: EscalationRule[];
  executiveFraming: ExecutiveFramingEntry[];
  procurementPsychology: PsychologyEntry[];
  capabilityGrounding: CapabilityGroundingEntry[];
  categoryIntelligence: CategoryIntelligenceEntry[];

  // Strategic direction (governs overall advisor behavior)
  strategicPrinciples: string[];
}

// ── Composite Context Layer ───────────────────────────────
// Output of the orchestrator. Merged, prioritized, filtered.
// This is what the advisory runtime consumes.

export interface CompositeContextLayer {
  sourceLayerIds: string[];
  activeReasoningRules: ReasoningRule[];
  activeNegotiationHeuristics: NegotiationHeuristic[];
  activeEscalationRules: EscalationRule[];
  activeExecutiveFraming: ExecutiveFramingEntry | null;
  activePsychologyEntries: PsychologyEntry[];
  activeShouldCostEntries: ShouldCostEntry[];
  activeCapabilityGrounding: CapabilityGroundingEntry[];
  strategicPrinciples: string[];

  // Pre-rendered system prompt contribution (locale-specific string)
  systemPromptContribution: string;

  // Metadata
  resolvedAt: number;
  locale: "pl" | "en";
}

// ── Context Resolution Request ────────────────────────────
// Input to the orchestrator.

export interface ContextResolutionRequest {
  deployment: DeploymentId;
  locale: "pl" | "en";
  intent?: IntentCode;
  urgency?: UrgencyLevel;
  maturity?: MaturityLevel;
  executiveRole?: ExecutiveRole;
}
