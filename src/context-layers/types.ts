// ─────────────────────────────────────────────────────────
// CIC — Context Layer Type System
//
// Domain Cognition Architecture — ETAP 6 + 7
// Context layers are reasoning artifacts, NOT documentation.
// They encode: advisory logic, negotiation intelligence,
// escalation patterns, executive framing, procurement psychology,
// capability grounding, supplier tactic detection, BATNA intelligence,
// leverage frameworks, concession logic and power dynamics.
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

// ── Locale-native bilingual snippet ──────────────────────
// NEVER use runtime translation. Every field with LocaleSnippet
// must provide pl + en authored natively.

export interface LocaleSnippet {
  pl: string;
  en: string;
}

// ── Regional Advisory Tone ────────────────────────────────
// Controls advisory style per locale/region. Enables locale-native
// procurement cognition — not just translation.

export type RegionCode = "PL" | "EN_UK" | "EN_US" | "DACH" | "CEE";

export interface RegionalAdvisoryTone {
  region: RegionCode;
  locale: "pl" | "en";
  negotiationStyle: string;            // how negotiations are typically framed
  advisoryDirectness: "high" | "medium" | "low";   // how direct/blunt to be
  executiveToneNote: string;           // executive communication style in region
  systemPromptNote: LocaleSnippet;     // injected when region matches
}

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
  label: string;
  condition: ContextActivationCondition;
  heuristic: string;
  systemPromptSnippet: LocaleSnippet;
  priority: number;                   // higher = injected first, wins conflicts
}

// ── Negotiation Intelligence ──────────────────────────────

export interface NegotiationHeuristic {
  id: string;
  scenario: string;
  leveragePoint: string;
  applicableIntents: IntentCode[];
  systemPromptSnippet: LocaleSnippet;
}

// ── Supplier Tactic Detection ─────────────────────────────
// Encodes known supplier pressure tactics and how to counter them.
// The advisor DIAGNOSES the tactic, then guides the counter-move.

export type SupplierTacticType =
  | "anchoring"
  | "artificial_urgency"
  | "market_panic_framing"
  | "inflation_manipulation"
  | "selective_benchmarking"
  | "false_scarcity"
  | "emotional_pressure"
  | "relationship_leverage"
  | "bundle_manipulation"
  | "volume_pressure"
  | "switching_cost_pressure"
  | "last_chance_framing"
  | "procurement_exhaustion"
  | "price_storytelling"
  | "index_manipulation";

export interface SupplierTacticPattern {
  id: string;
  tactic: SupplierTacticType;
  description: string;                // what the tactic looks like
  detectionSignals: string[];         // language/behavioral signals to detect
  counterMoves: string[];             // how to respond strategically
  systemPromptSnippet: LocaleSnippet; // injected into prompt when tactic is likely
  priority: number;
}

// ── Leverage Framework ─────────────────────────────────────
// Encodes REAL sources of negotiation power.

export type LeverageType =
  | "market_alternatives"
  | "spend_concentration"
  | "contract_terms"
  | "payment_terms"
  | "logistics_participation"
  | "volume_optionality"
  | "benchmark_data"
  | "operational_dependency"
  | "strategic_dependency"
  | "switching_cost"
  | "timing_advantage"
  | "specification_flexibility"
  | "multi_axis_negotiation";

export interface LeverageVector {
  id: string;
  type: LeverageType;
  description: string;
  activationCondition: ContextActivationCondition;
  diagnosticQuestion: LocaleSnippet;  // the sharp question to assess this leverage
  systemPromptSnippet: LocaleSnippet;
}

// ── BATNA Intelligence ─────────────────────────────────────

export type BATNAStrength = "strong" | "moderate" | "weak" | "unknown";

export interface BATNAIntelligenceEntry {
  id: string;
  scenario: string;                   // e.g., "single source, high switching cost"
  baTNAStrength: BATNAStrength;
  diagnosticSignals: string[];        // how to detect BATNA strength from conversation
  advisory: string;                   // what to advise given this BATNA situation
  systemPromptSnippet: LocaleSnippet;
}

// ── Concession Intelligence ───────────────────────────────

export type ConcessionRiskType =
  | "premature_concession"
  | "value_loss_without_exchange"
  | "concession_escalation_trap"
  | "exhaustion_concession"
  | "anchoring_concession"
  | "relationship_concession"
  | "panic_concession";

export interface ConcessionPattern {
  id: string;
  risk: ConcessionRiskType;
  description: string;
  warningSignals: string[];
  counterStrategy: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Pricing Manipulation Intelligence ────────────────────

export type PriceManipulationType =
  | "unjustified_increase"
  | "index_misuse"
  | "hidden_margin"
  | "cost_inflation_narrative"
  | "asymmetric_cost_pass_through"
  | "bundled_price_obscurity"
  | "retroactive_adjustment";

export interface PriceManipulationPattern {
  id: string;
  type: PriceManipulationType;
  detectionSignals: string[];
  challengeApproach: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Power Dynamics ─────────────────────────────────────────

export type PowerImbalanceType =
  | "buyer_weakness"
  | "supplier_dominance"
  | "internal_fragmentation"
  | "budget_panic"
  | "operational_dependency"
  | "executive_pressure"
  | "low_visibility";

export interface PowerDynamicsEntry {
  id: string;
  imbalance: PowerImbalanceType;
  detectionSignals: string[];
  advisoryApproach: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Negotiation Sequencing ─────────────────────────────────

export type NegotiationStageType =
  | "pre_negotiation_diagnosis"
  | "leverage_building"
  | "active_negotiation"
  | "concession_phase"
  | "escalation_to_workshop"
  | "escalation_to_discovery"
  | "post_negotiation_review";

export interface NegotiationSequenceRule {
  id: string;
  stage: NegotiationStageType;
  condition: ContextActivationCondition;
  advisoryAction: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Negotiation Diagnostic Questions ─────────────────────
// Sharp 1-2 question diagnostic triggers per scenario.
// NEVER build long discovery interviews.

export interface NegotiationDiagnostic {
  id: string;
  scenario: string;                   // when to trigger these questions
  triggerIntents: IntentCode[];
  questions: {
    primary: LocaleSnippet;           // the single most important question
    secondary?: LocaleSnippet;        // optional follow-up if needed
  };
  whatToListenFor: string;            // what the answer reveals
}

// ── Multilingual Injection Pattern ───────────────────────
// Security: prompt injection detection in PL + EN

export interface MultilingualInjectionPattern {
  id: string;
  pattern: RegExp;
  language: "pl" | "en" | "both";
  description: string;
}

// ── Should-Cost Entry (existing, kept for compatibility) ──

export interface ShouldCostEntry {
  id: string;
  useCase: string;
  costDriverFocus: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Escalation Rule ───────────────────────────────────────

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
  systemPromptSnippet: LocaleSnippet;
}

// ── Executive Framing ─────────────────────────────────────

export interface ExecutiveFramingEntry {
  role: ExecutiveRole;
  kpis: string[];
  framingPrinciple: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Procurement Psychology ────────────────────────────────

export interface PsychologyEntry {
  id: string;
  pattern: string;
  underlyingNeed: string;
  advisoryResponse: string;
  systemPromptSnippet: LocaleSnippet;
}

// ── Capability Grounding ──────────────────────────────────

export interface CapabilityGroundingEntry {
  capabilityId: string;
  capabilityName: string;
  businessProblems: string[];
  triggerIntents: IntentCode[];
  triggerUrgency: UrgencyLevel[];
  systemPromptSnippet: LocaleSnippet;
}

// ── Category Intelligence ─────────────────────────────────

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
  version: string;
  publishedAt: string;
  breakingChange: boolean;
  changelog: string;
  author: string;
}

// ── Full Context Layer Definition ─────────────────────────

export interface ContextLayer {
  // Identity
  id: string;
  name: string;
  description: string;
  domain: ContextLayerDomain;
  version: ContextLayerVersion;

  // Scope
  deployments: DeploymentId[];
  locales: LocaleScope[];
  priority: number;

  // Default activation (layer-level gate)
  defaultActivation: ContextActivationCondition;

  // Core cognition artifacts (ETAP 6)
  advisoryLogic: ReasoningRule[];
  negotiationLogic: NegotiationHeuristic[];
  shouldCostLogic: ShouldCostEntry[];
  escalationLogic: EscalationRule[];
  executiveFraming: ExecutiveFramingEntry[];
  procurementPsychology: PsychologyEntry[];
  capabilityGrounding: CapabilityGroundingEntry[];
  categoryIntelligence: CategoryIntelligenceEntry[];

  // Negotiation cognition artifacts (ETAP 7)
  supplierTactics: SupplierTacticPattern[];
  leverageVectors: LeverageVector[];
  bATNAIntelligence: BATNAIntelligenceEntry[];
  concessionPatterns: ConcessionPattern[];
  priceManipulationPatterns: PriceManipulationPattern[];
  powerDynamics: PowerDynamicsEntry[];
  negotiationSequencing: NegotiationSequenceRule[];
  negotiationDiagnostics: NegotiationDiagnostic[];

  // Strategic direction
  strategicPrinciples: string[];
}

// ── Composite Context Layer ───────────────────────────────

export interface CompositeContextLayer {
  sourceLayerIds: string[];

  // ETAP 6
  activeReasoningRules: ReasoningRule[];
  activeNegotiationHeuristics: NegotiationHeuristic[];
  activeEscalationRules: EscalationRule[];
  activeExecutiveFraming: ExecutiveFramingEntry | null;
  activePsychologyEntries: PsychologyEntry[];
  activeShouldCostEntries: ShouldCostEntry[];
  activeCapabilityGrounding: CapabilityGroundingEntry[];
  strategicPrinciples: string[];

  // ETAP 7
  activeSupplierTactics: SupplierTacticPattern[];
  activeLeverageVectors: LeverageVector[];
  activeBATNAIntelligence: BATNAIntelligenceEntry[];
  activeConcessionPatterns: ConcessionPattern[];
  activePriceManipulationPatterns: PriceManipulationPattern[];
  activePowerDynamics: PowerDynamicsEntry[];
  activeNegotiationSequencing: NegotiationSequenceRule[];
  activeNegotiationDiagnostics: NegotiationDiagnostic[];

  // Pre-rendered system prompt contribution
  systemPromptContribution: string;

  // Metadata
  resolvedAt: number;
  locale: "pl" | "en";
}

// ── Context Resolution Request ────────────────────────────

export interface ContextResolutionRequest {
  deployment: DeploymentId;
  locale: "pl" | "en";
  intent?: IntentCode;
  urgency?: UrgencyLevel;
  maturity?: MaturityLevel;
  executiveRole?: ExecutiveRole;
}

