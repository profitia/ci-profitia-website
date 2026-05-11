// ─────────────────────────────────────────────────────────
// ETAP 7.5 — Advisory Penetration Test: Type System
// ─────────────────────────────────────────────────────────

// ── Scenario ──────────────────────────────────────────────

export type ScenarioCategory =
  | "A-procurement-operations"
  | "B-negotiation-intelligence"
  | "C-executive-conversations"
  | "D-psychology-tests"
  | "E-adversarial-tests"
  | "F-multilingual-tests";

export type ScenarioLocale = "pl" | "en" | "mixed";

export interface SessionStateInput {
  phase: string;
  detectedIntent: string;
  intentConfidence: number;
  urgency: string;          // "U1" | "U2" | "U3"
  buyingStage: string;      // "awareness" | "consideration" | "decision"
  maturity: string;         // "reactive" | "developing" | "strategic"
  engagementScore: number;  // 0–1
  ctaFatigue: number;       // 0–5
  escalationReady: boolean;
  journeyId: string | null;
  journeyStep: number;
}

export interface PageContextInput {
  slug: string;
  primaryIntent: string;
}

export interface IntelligenceInput {
  pagesVisited: string[];
  scrollDepth: Record<string, number>;
  timeOnPage: Record<string, number>;
  behavioralSignals: Array<{
    type: string;
    pageSlug: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }>;
  recommendationsShown: string[];
  ctasShown: string[];
  ctaClicked: string | null;
}

export interface ScenarioTurn {
  /** User's message for this turn */
  user: string;
  /** Keywords/phrases that SHOULD appear in the assistant's response */
  expectedKeywords?: string[];
  /** Phrases/patterns that must NOT appear in the response */
  forbiddenPhrases?: string[];
  /** If true, evaluator checks for diagnostic question presence */
  expectsDiagnosticQuestion?: boolean;
  /** If true, evaluator checks for escalation CTA */
  expectsEscalation?: boolean;
  /** If true, evaluator checks for injection resistance */
  isInjectionAttempt?: boolean;
  /** Notes for human reviewer */
  note?: string;
}

export interface AdvisoryScenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  locale: ScenarioLocale;
  pageSlug: string;
  sessionState: SessionStateInput;
  pageContext: PageContextInput;
  turns: ScenarioTurn[];
  /** Expected primary intent the system should detect */
  expectedIntent?: string;
  /** Expected urgency level */
  expectedUrgency?: string;
  /** Whether escalation should be triggered */
  expectedEscalation?: boolean;
  /** Expected capabilities to be mentioned */
  expectedCapabilities?: string[];
  /** True for adversarial/security test scenarios */
  adversarial?: boolean;
  tags?: string[];
}

// ── Transcript ────────────────────────────────────────────

export interface AdvisoryMetadata {
  intent?: string;
  confidence?: number;
  urgency?: string;
  phase?: string;
}

export interface TurnRecord {
  turnIndex: number;
  userMessage: string;
  assistantResponse: string;
  assistantMetadata: AdvisoryMetadata | null;
  durationMs: number;
  wordCount: number;
  bulletCount: number;
  questionCount: number;
  flags: RedFlag[];
  turnScore: TurnEvaluation;
}

export interface ConversationTranscript {
  scenarioId: string;
  scenario: AdvisoryScenario;
  sessionId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  turns: TurnRecord[];
  evaluation: EvaluationResult;
  runError?: string;
}

// ── Red Flags ─────────────────────────────────────────────

export type RedFlagType =
  | "ai_sounding"
  | "generic_consulting"
  | "overexplaining"
  | "weak_negotiation_advice"
  | "weak_escalation"
  | "vague_recommendation"
  | "too_many_bullets"
  | "lack_of_diagnosis"
  | "helpdesk_tone"
  | "early_product_pitch"
  | "injection_succeeded"
  | "hallucination_detected"
  | "role_confusion"
  | "fake_data_accepted"
  | "system_prompt_revealed"
  | "no_business_framing"
  | "missing_expected_keyword"
  | "forbidden_phrase_appeared";

export type RedFlagSeverity = "low" | "medium" | "high" | "critical";

export interface RedFlag {
  type: RedFlagType;
  /** Human-readable explanation of the flag */
  detail: string;
  severity: RedFlagSeverity;
  turnIndex: number;
  matchedPattern?: string;
}

// ── Evaluation ────────────────────────────────────────────

export interface TurnEvaluation {
  /** 0–100 */
  procurementQuality: number;
  /** 0–100 */
  negotiationQuality: number;
  /** 0–100 */
  communicationQuality: number;
  /** 0–100 */
  advisorySharpness: number;
  /** 0–100 */
  escalationTimeliness: number;
  /** 0–100 */
  injectionResistance: number;
  /** 0–100 */
  realism: number;
  /** Weighted composite */
  composite: number;
}

export interface MultilingualQualityMetrics {
  plScore: number;
  enScore: number;
  gapScore: number;        // how large is PL vs EN gap
  mixedHandling: number;   // how well mixed PL/EN is handled
  terminologyNaturalness: number;
  translationArtifacts: number; // how many EN-sounds-like-translated-PL phrases
}

export interface EvaluationResult {
  scenarioId: string;
  overallScore: number;          // 0–100 weighted composite

  // Dimension scores
  procurementIntelligence: number;
  negotiationIntelligence: number;
  executiveAdvisory: number;
  escalationQuality: number;
  uxQuality: number;
  realism: number;
  multilingualQuality: number;
  securityQuality: number;

  // Diagnostic metrics
  hallucinations: number;        // count of detected hallucination signals
  aiToneScore: number;           // 0=robotic, 100=human
  verbosityScore: number;        // 0=too long, 100=ideal, 50=too short
  advisorySharpness: number;     // 0–100
  procurementRealism: number;    // 0–100
  executiveRealism: number;      // 0–100
  escalationTiming: number;      // 0–100
  recommendationQuality: number; // 0–100
  injectionResistance: number;   // 0–100 (for adversarial scenarios)
  diagnosticQuestionQuality: number; // 0–100

  // Findings
  redFlags: RedFlag[];
  totalRedFlags: number;
  criticalRedFlags: number;
  criticalFindings: string[];
  strengths: string[];
  recommendations: string[];

  multilingual?: MultilingualQualityMetrics;
}

// ── Report ────────────────────────────────────────────────

// ── Simplified report types (match report-generator.ts implementation) ───────

export interface CategoryReportEntry {
  category: string;
  count: number;
  avgScore: number;
  avgProcurement: number;
  avgCommunication: number;
  avgAdvisory: number;
  avgSecurity: number;
  totalRedFlags: number;
  criticalRedFlags: number;
}

export interface TopProblem {
  type: string;
  count: number;
}

export interface ConversationHighlight {
  scenarioId: string;
  title: string;
  score: number;
}

export interface PenetrationReport {
  generatedAt: string;
  runDurationMs: number;
  baseUrl: string;

  // Summary
  totalScenarios: number;
  completedScenarios: number;
  failedScenarios: number;
  overallScore: number;

  // Executive
  executiveSummary: string;

  // By category
  categoryReports: CategoryReportEntry[];

  // Top findings
  top25Problems: TopProblem[];
  commonAIBehaviors: number;          // count of AI-sounding flags
  strongestAdvisoryBehaviors: number; // count of scenarios with score >= 80

  // Highlights
  bestConversations: ConversationHighlight[];
  worstConversations: ConversationHighlight[];

  // Domain assessment scores (0–100)
  negotiationIntelligenceAssessment: number;
  procurementCognitionAssessment: number;
  escalationAssessment: number;
  uxAssessment: number;
  multilingualGap: number;
  hallucinationAssessment: number;
  securityAssessment: number;
  injectionResistance: number;
  aiToneScore: number;
  verbosityScore: number;

  // Findings
  criticalFindings: string[];

  // Actions
  priorityFixes: string[];
  recommendedNextIteration: string[];
}

// ── Internal runner types ─────────────────────────────────

export interface ChatAPIPayload {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  locale: "pl" | "en";
  pageContext: PageContextInput;
  sessionState: SessionStateInput;
}

export interface APICallResult {
  text: string;
  metadata: AdvisoryMetadata | null;
  durationMs: number;
  error?: string;
}

export interface RunOptions {
  baseUrl: string;
  delayBetweenCallsMs: number;
  delayBetweenScenariosMs: number;
  maxConcurrency: number;
  saveTranscripts: boolean;
  transcriptsDir: string;
  reportsDir: string;
  screenshotsDir: string;
  verbose: boolean;
  categoryFilter?: ScenarioCategory;
  scenarioIdFilter?: string;
  dryRun: boolean;
}

export const DEFAULT_RUN_OPTIONS: RunOptions = {
  baseUrl: "http://localhost:3000",
  delayBetweenCallsMs: 800,
  delayBetweenScenariosMs: 1500,
  maxConcurrency: 1,          // sequential by default — avoids rate limits
  saveTranscripts: true,
  transcriptsDir: "src/testing/advisory-penetration/transcripts",
  reportsDir: "src/testing/advisory-penetration/reports",
  screenshotsDir: "src/testing/advisory-penetration/screenshots",
  verbose: true,
  dryRun: false,
};

// ── Default session state factory ─────────────────────────

export function makeSessionState(overrides: Partial<SessionStateInput> = {}): SessionStateInput {
  return {
    phase: "diagnostic",
    detectedIntent: "UNKNOWN",
    intentConfidence: 0.4,
    urgency: "U2",
    buyingStage: "consideration",
    maturity: "developing",
    engagementScore: 0.5,
    ctaFatigue: 0,
    escalationReady: false,
    journeyId: null,
    journeyStep: 0,
    ...overrides,
  };
}

export function makePageContext(slug: string, intent: string): PageContextInput {
  return { slug, primaryIntent: intent };
}

export function makeIntelligence(overrides: Partial<IntelligenceInput> = {}): IntelligenceInput {
  return {
    pagesVisited: ["/"],
    scrollDepth: {},
    timeOnPage: {},
    behavioralSignals: [],
    recommendationsShown: [],
    ctasShown: [],
    ctaClicked: null,
    ...overrides,
  };
}
