// ─────────────────────────────────────────────────────────
// CI-Profitia Website — Core Types
// Procurement Advisory Conversational Layer
// ─────────────────────────────────────────────────────────

// ── Locale ────────────────────────────────────────────────
export type Locale = "pl" | "en";

// ── Intent System (mirrors CIC I1–I8) ─────────────────────
export type IntentCode =
  | "I1_SAVINGS"
  | "I2_FORECASTING"
  | "I3_SUPPLIER_RISK"
  | "I4_DIGITALIZATION"
  | "I5_SOURCING"
  | "I6_EDUCATION"
  | "I7_EXPLORATORY"
  | "I8_NEGOTIATIONS"
  | "UNKNOWN";

// ── Urgency Levels ────────────────────────────────────────
export type UrgencyLevel = "U1" | "U2" | "U3"; // U1=urgent, U2=active, U3=exploratory

// ── Buying Stage ──────────────────────────────────────────
export type BuyingStage = "S1" | "S2" | "S3" | "S4" | "S5"; // S1=awareness → S5=decision

// ── Procurement Maturity ──────────────────────────────────
export type ProcurementMaturity =
  | "reactive"       // firefighting, no structure
  | "operational"    // basic process, limited analytics
  | "analytical"     // data-driven, some benchmarks
  | "strategic"      // proactive, C-suite aligned
  | "unknown";

// ── Page Context ─────────────────────────────────────────
export type PageSlug =
  | "/"
  | "/services"
  | "/education"
  | "/blog"
  | "/about"
  | "/contact"
  | "/career"
  // Service pages
  | "/services/projekty-doradcze"
  | "/services/interim-management"
  | "/services/procurement-transformation"
  | "/services/category-strategy"
  | "/services/operating-model-design"
  | "/services/procurement-pmo"
  | "/services/analiza-spot"
  | "/services/should-cost-analysis"
  | "/services/negotiation-preparation"
  | "/services/supplier-benchmarking"
  | "/services/supplier-negotiation-support"
  | "/services/spend-cube"
  | "/services/spend-analytics"
  | "/services/procurement-dashboards"
  | "/services/supplier-intelligence"
  | "/services/procurement-kpi-systems"
  | "/services/coaching-zakupowy"
  // Education pages
  | "/education/akademia-zakupow"
  | "/education/procurement-excellence"
  | "/education/strategic-sourcing"
  | "/education/warsztaty-negocjacyjne"
  | "/education/advanced-negotiations"
  | "/education/fact-based-negotiation"
  | "/education/in-company-workshops"
  | "/education/spend-analytics-training"
  | "/education/supplier-financial-analysis"
  | "/education/procurement-mentoring"
  | string; // extensible

export interface PageContext {
  slug: PageSlug;
  primaryIntent: IntentCode;
  secondaryIntents: IntentCode[];
  conversionTier: 1 | 2 | 3 | 4 | 5;
  escalationReadiness: "high" | "medium" | "low";
}

// ── Conversation ──────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  intent?: IntentCode;
  confidence?: number;
  recommendations?: RecommendationCard[];
  ctas?: CTAItem[];
  journeyStep?: number;
  behavioralSignal?: BehavioralSignal;
}

// ── Session ───────────────────────────────────────────────
export interface AdvisorySession {
  id: string;
  locale: Locale;
  startedAt: number;
  lastActivityAt: number;
  pageContext: PageContext;
  messages: Message[];
  state: SessionState;
  intelligence: SessionIntelligence;
}

export interface SessionState {
  phase: ConversationPhase;
  detectedIntent: IntentCode;
  intentConfidence: number;
  urgency: UrgencyLevel;
  buyingStage: BuyingStage;
  maturity: ProcurementMaturity;
  journeyId: string | null;
  journeyStep: number;
  escalationReady: boolean;
  ctaFatigue: number; // 0-3, how many CTAs shown
  engagementScore: number; // 0-100
}

export type ConversationPhase =
  | "idle"
  | "opening"
  | "intent_discovery"
  | "problem_framing"
  | "capability_recommendation"
  | "objection_handling"
  | "escalation"
  | "post_escalation";

export interface SessionIntelligence {
  pagesVisited: PageSlug[];
  scrollDepth: Record<string, number>; // page → %
  timeOnPage: Record<string, number>; // page → ms
  behavioralSignals: BehavioralSignal[];
  recommendationsShown: string[]; // recommendation IDs
  ctasShown: string[]; // CTA IDs
  ctaClicked: string | null;
}

// ── Behavioral Signals ────────────────────────────────────
export type BehavioralSignalType =
  | "hesitation"
  | "deep_scroll"
  | "repeated_visit"
  | "cta_avoidance"
  | "positive_engagement"
  | "comparison_trigger"
  | "pricing_hesitation"
  | "inactivity";

export interface BehavioralSignal {
  type: BehavioralSignalType;
  pageSlug: PageSlug;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ── Recommendations ───────────────────────────────────────
export type RecommendationType =
  | "service"
  | "education"
  | "blog"
  | "case_study"
  | "capability";

export interface RecommendationCard {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  url: string;
  cta: string;
  intentFit: IntentCode[];
  urgencyFit: UrgencyLevel[];
  priority: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
  confidenceThreshold: number; // min confidence to show
  tags: string[];
}

// ── CTA System ────────────────────────────────────────────
export type CTAType =
  | "contact_form"      // EP-1: /contact
  | "spot_analysis"     // EP-2: fast diagnostic
  | "workshop"          // EP-3: education enquiry
  | "phone"             // EP-4: direct call
  | "email"             // EP-5: direct email
  | "service_order"     // EP-6: specific service
  | "coaching"          // EP-7: mentoring/coaching
  | "content";          // micro CTA: read article

export interface CTAItem {
  id: string;
  type: CTAType;
  label: string;
  url: string;
  urgencyFit: UrgencyLevel[];
  intentFit: IntentCode[];
  buyingStageMin: BuyingStage;
  strength: number; // 1-10
  friction: "low" | "medium" | "high";
}

// ── Conversational Journey ────────────────────────────────
export interface ConversationalJourney {
  id: string;
  intentCode: IntentCode;
  steps: JourneyStep[];
  escalationPath: CTAType;
}

export interface JourneyStep {
  step: number;
  question?: string;
  recommendation?: string; // recommendation ID
  cta?: string; // CTA ID
  condition?: string; // when to show this step
}

// ── Analytics Events (base — expanded in ETAP 2) ─────────
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  sessionId: string;
  timestamp: number;
  locale: Locale;
  pageSlug: PageSlug;
  payload: Record<string, unknown>;
}

// ── Feature Flags ─────────────────────────────────────────
export interface FeatureFlags {
  advisoryAssistant: boolean;
  inlineRecommendations: boolean;
  behavioralTracking: boolean;
  streamingResponses: boolean;
  proactiveEngagement: boolean;
  experimentVariant: string | null;
}

// ── Widget Config ─────────────────────────────────────────
export interface AssistantWidgetConfig {
  position: "bottom-right" | "bottom-left";
  autoOpenDelay: number | null; // ms, null = never auto-open
  proactiveMessage: string | null;
  locale: Locale;
  features: FeatureFlags;
}

// ═══════════════════════════════════════════════════════════
// ETAP 2 — Intelligence Engine Types
// ═══════════════════════════════════════════════════════════

// ── Intent Intelligence ───────────────────────────────────
export interface IntentSignal {
  source: "message" | "page" | "behavioral" | "cta" | "visit_pattern";
  intentCode: IntentCode;
  weight: number; // 0–1
  timestamp: number;
  raw?: string;
}

export interface IntentScore {
  primary: IntentCode;
  primaryConfidence: number; // 0–1
  secondary: IntentCode | null;
  secondaryConfidence: number;
  urgency: UrgencyLevel;
  businessImpact: "critical" | "high" | "medium" | "low";
  escalationProbability: number; // 0–1
  workshopProbability: number; // 0–1
  signals: IntentSignal[];
}

// ── Maturity Engine ───────────────────────────────────────
export type MaturityPersona =
  | "reactive_buyer"          // firefighting, no strategy, urgent problems
  | "operational_buyer"       // process-aware, but analytics-limited
  | "strategic_sourcer"       // benchmarks, category mgmt, some analytics
  | "advanced_analyst"        // spend visibility, data-driven decisions
  | "executive_stakeholder"   // C-suite lens: margin, risk, predictability
  | "transformation_leader"   // systemic change mandate
  | "unknown";

export type AdvisoryTone =
  | "diagnostic"    // reactive buyers — explain, diagnose, educate
  | "analytical"    // operational buyers — show data, process
  | "strategic"     // strategic sourcers — frameworks, benchmarks
  | "executive"     // executives — business impact, ROI, risk
  | "peer";         // transformation leaders — peer-level conversation

export interface MaturitySignal {
  type: "language" | "question_depth" | "page_visited" | "engagement" | "cta_interaction";
  signal: string;
  maturityScore: number; // 0–4 (0=reactive, 4=transformation)
  weight: number;
}

export interface MaturityScore {
  persona: MaturityPersona;
  level: ProcurementMaturity;
  score: number; // 0–100
  confidence: number; // 0–1
  tone: AdvisoryTone;
  shouldEducate: boolean;
  shouldEscalate: boolean;
  analyticsMaturity: "none" | "basic" | "intermediate" | "advanced";
  negotiationSophistication: "none" | "basic" | "experienced" | "expert";
}

// ── Routing Engine ────────────────────────────────────────
export interface AdvisoryRoute {
  journeyId: string;
  intent: IntentCode;
  entryPoint: string; // recommendation ID or page slug
  steps: AdvisoryRouteStep[];
  escalationCTA: CTAType;
  estimatedSteps: number;
}

export interface AdvisoryRouteStep {
  stepIndex: number;
  type: "question" | "recommendation" | "insight" | "escalation";
  content?: string;
  recommendationId?: string;
  ctaId?: string;
  condition?: RoutingCondition;
}

export interface RoutingCondition {
  field: keyof SessionState;
  operator: "eq" | "gte" | "lte" | "includes";
  value: unknown;
}

export interface RoutingDecision {
  route: AdvisoryRoute | null;
  confidence: number;
  escalationScore: number; // 0–100
  nextStep: AdvisoryRouteStep | null;
  shouldEscalateNow: boolean;
  shouldShowRecommendation: boolean;
  shouldAskQuestion: boolean;
  reason: string;
}

// ── Advisory State Machine ────────────────────────────────
export type AdvisoryFatigueLevel = "none" | "mild" | "moderate" | "high";

export interface AdvisoryFatigue {
  level: AdvisoryFatigueLevel;
  ctaCount: number;
  recommendationCount: number;
  messageCount: number;
  shouldPauseRecommendations: boolean;
  shouldPauseCTAs: boolean;
  recoveryAction: "educate" | "ask_question" | "silence" | "none";
}

export interface RecommendationPacing {
  canShowRecommendation: boolean;
  canShowCTA: boolean;
  delayMs: number; // recommended wait before next show
  reason: string;
}

export interface StateTransition {
  from: ConversationPhase;
  to: ConversationPhase;
  trigger: string;
  timestamp: number;
}

// ── Proactive Engine ──────────────────────────────────────
export type ProactiveTriggerType =
  | "deep_scroll_high_intent"    // 75%+ scroll on Tier 1–2 page
  | "repeated_visit"             // 2+ visits same page
  | "idle_after_recommendation"  // inactivity after rec shown
  | "pricing_page_dwell"         // >30s on service page
  | "comparison_behavior"        // multiple service pages visited
  | "workshop_readiness"         // education intent + engagement
  | "escalation_ready"           // high score across signals
  | "hesitation_recovery";       // hesitation + deep scroll

export interface ProactiveTrigger {
  type: ProactiveTriggerType;
  score: number; // 0–100, trigger confidence
  pageSlug: PageSlug;
  message: Record<Locale, string>;
  ctaType: CTAType;
  delay: number; // ms before showing
  priority: number; // lower = higher priority
}

export interface ProactiveState {
  triggered: boolean;
  trigger: ProactiveTrigger | null;
  shownAt: number | null;
  dismissed: boolean;
  converted: boolean;
}

// ── Recommendation Intelligence v2 ───────────────────────
export interface RecommendationScore {
  card: RecommendationCard;
  totalScore: number; // 0–100
  intentScore: number;
  urgencyScore: number;
  pageContextScore: number;
  behavioralScore: number;
  fatiguepenalty: number;
  maturityFit: number;
  journeyPositionScore: number;
}

export interface RecommendationDecision {
  ranked: RecommendationScore[];
  topRecommendations: RecommendationCard[]; // final top 2–3
  shouldShow: boolean;
  timing: "immediate" | "after_response" | "delayed";
  contextualReason: string;
}

// ── Session Intelligence ──────────────────────────────────
export type SessionDepth = "surface" | "engaged" | "deep" | "committed";

export interface SessionHealth {
  depth: SessionDepth;
  engagementTrend: "growing" | "stable" | "declining";
  escalationLikelihood: number; // 0–1
  advisoryReadiness: number; // 0–1
  intentStability: boolean; // has intent been consistent?
  conversionProbability: number; // 0–1
}

export interface BehavioralPattern {
  dominantSignal: BehavioralSignalType | null;
  hesitationCount: number;
  positiveEngagementCount: number;
  inactivityCount: number;
  deepScrollCount: number;
  isComparing: boolean;
  isPricingHesitant: boolean;
}

export interface AdvisoryReadiness {
  score: number; // 0–100
  isReady: boolean;
  blockers: string[];
  accelerators: string[];
}

// ── Orchestrator Output ───────────────────────────────────
export interface AdvisoryDecision {
  intent: IntentScore;
  maturity: MaturityScore;
  routing: RoutingDecision;
  fatigue: AdvisoryFatigue;
  pacing: RecommendationPacing;
  proactive: ProactiveTrigger | null;
  recommendations: RecommendationDecision;
  sessionHealth: SessionHealth;
  behavioralPattern: BehavioralPattern;
  advisoryReadiness: AdvisoryReadiness;
  systemPromptContext: SystemPromptContext;
}

export interface SystemPromptContext {
  maturityTone: AdvisoryTone;
  shouldEducate: boolean;
  shouldEscalate: boolean;
  escalationUrgency: "hard" | "soft" | "none";
  journeyStep: number;
  recommendedServices: string[];
  nextQuestion: string | null;
  escalationMessage: string | null;
}

// ── Analytics expansion ───────────────────────────────────
export type AnalyticsEventType =
  | "session_start"
  | "assistant_opened"
  | "assistant_closed"
  | "message_sent"
  | "message_received"
  | "intent_detected"
  | "maturity_detected"
  | "routing_decision"
  | "recommendation_shown"
  | "recommendation_clicked"
  | "cta_shown"
  | "cta_clicked"
  | "journey_started"
  | "journey_step"
  | "journey_completed"
  | "escalation_triggered"
  | "proactive_triggered"
  | "proactive_dismissed"
  | "proactive_converted"
  | "behavioral_signal"
  | "page_context_change"
  | "engagement_score_update"
  | "fatigue_detected"
  | "session_health_update"
  | "advisory_readiness_update"
  | "state_transition"
  // ETAP 3
  | "inline_block_shown"
  | "widget_shown"
  | "widget_clicked"
  | "capability_discovered"
  | "navigation_hint_followed"
  | "adaptive_cta_clicked"
  | "executive_mode_activated"
  | "section_adapted"
  | "discovery_path_started";

// ═══════════════════════════════════════════════════════════
// ETAP 3 — Embedded Advisory + Adaptive Website Types
// ═══════════════════════════════════════════════════════════

// ── Page Section Taxonomy ─────────────────────────────────
export type PageSection =
  | "hero"
  | "services_overview"
  | "capability_block"
  | "case_study"
  | "proof_point"
  | "pricing"
  | "workshop"
  | "cta_section"
  | "benchmark"
  | "about"
  | "footer_cta"
  | "navigation"
  | "testimonial"
  | "roi_block";

// ── Executive Roles ───────────────────────────────────────
export type ExecutiveRole =
  | "CFO"
  | "CEO"
  | "CPO"
  | "procurement_director"
  | "category_manager"
  | "general";

export interface ExecutiveProfile {
  role: ExecutiveRole;
  kpis: string[];
  messagingAngle: string;
  tone: AdvisoryTone;
  priorityIntents: IntentCode[];
}

// ── Inline Advisory Block ─────────────────────────────────
export type AdvisoryBlockType =
  | "insight"
  | "benchmark"
  | "proof_point"
  | "workshop_prompt"
  | "roi_insight"
  | "risk_insight"
  | "executive_summary"
  | "capability_teaser"
  | "diagnostic_question";

export interface AdvisoryBlock {
  id: string;
  type: AdvisoryBlockType;
  section: PageSection;
  intents: IntentCode[];
  maturityPersonas: MaturityPersona[];
  locale: Locale;
  headline: string;
  body: string;
  metric?: { label: string; value: string };
  cta: { label: string; url: string; type: CTAType };
  priority: number; // 1-10
  executiveRoles?: ExecutiveRole[];
  tags: string[];
}

export interface BlockPlacementDecision {
  blocks: AdvisoryBlock[];
  primary: AdvisoryBlock | null;
  sections: Partial<Record<PageSection, AdvisoryBlock>>;
}

// ── Contextual Widget ─────────────────────────────────────
export type WidgetType =
  | "recommendation"
  | "advisory_insight"
  | "proof_point"
  | "benchmark_insight"
  | "workshop_recommendation"
  | "transformation_prompt"
  | "roi_insight"
  | "supplier_risk_insight"
  | "executive_summary"
  | "capability_teaser"
  | "diagnostic";

export interface ContextualWidget {
  id: string;
  type: WidgetType;
  intents: IntentCode[];
  maturityPersonas: MaturityPersona[];
  locale: Locale;
  title: string;
  content: string;
  metrics?: Array<{ label: string; value: string }>;
  cta?: { label: string; url: string; type: CTAType };
  priority: number; // 1-10
  executiveRoles?: ExecutiveRole[];
  tags: string[];
}

export interface WidgetDecision {
  widgets: ContextualWidget[];
  primaryWidget: ContextualWidget | null;
  rationale: string;
}

// ── Capability Discovery ──────────────────────────────────
export interface CapabilityNode {
  id: string;
  slug: PageSlug;
  name: Record<Locale, string>;
  intents: IntentCode[];
  maturityPersonas: MaturityPersona[];
  description: Record<Locale, string>;
  shortLabel: Record<Locale, string>;
  relatedIds: string[];
  advisoryPathNext: string[]; // ordered IDs for advisory journey
  executiveRelevance: ExecutiveRole[];
  tags: string[];
}

export interface CapabilityEdge {
  from: string;
  to: string;
  weight: number; // 0–1
  reason: Record<Locale, string>;
}

export interface CapabilityDiscoveryDecision {
  current: CapabilityNode | null;
  nextCapabilities: CapabilityNode[];
  advisoryPath: CapabilityNode[];
  rationale: string;
}

// ── Adaptive CTA ──────────────────────────────────────────
export interface AdaptiveCTAConfig {
  id: string;
  label: Record<Locale, string>;
  subLabel?: Record<Locale, string>;
  url: string;
  type: CTAType;
  urgencyFit: UrgencyLevel[];
  maturityPersonas: MaturityPersona[];
  executiveRoles?: ExecutiveRole[];
  intents: IntentCode[];
  strength: number; // 1-10
}

export interface CTADecision {
  primary: AdaptiveCTAConfig;
  secondary: AdaptiveCTAConfig | null;
  rationale: string;
}

// ── Navigation Intelligence ───────────────────────────────
export interface NavigationHint {
  id: string;
  message: Record<Locale, string>;
  targetSlug: PageSlug;
  targetLabel: Record<Locale, string>;
  confidence: number; // 0–1
  intent: IntentCode;
  maturityPersonas: MaturityPersona[];
}

export interface NavigationDecision {
  hint: NavigationHint | null;
  alternativePaths: NavigationHint[];
  rationale: string;
}

// ── Adaptive Page Experience ──────────────────────────────
export interface AdaptivePageConfig {
  sectionOrder: PageSection[];
  visibleSections: PageSection[];
  highlightedSections: PageSection[];
  executiveMode: boolean;
  persona: MaturityPersona;
  executiveRole: ExecutiveRole;
}

// ── ETAP 3 Orchestrator Output ────────────────────────────
export interface ETAP3Decision {
  inlineBlocks: BlockPlacementDecision;
  widgets: WidgetDecision;
  navigation: NavigationDecision;
  cta: CTADecision;
  capability: CapabilityDiscoveryDecision;
  adaptivePage: AdaptivePageConfig;
  executiveProfile: ExecutiveProfile;
}
