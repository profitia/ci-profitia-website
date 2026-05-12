// ─────────────────────────────────────────────────────────
// ETAP 8.5 — Human Mode Router
// Detects interaction context from messages and routes to
// the appropriate executive persona mode.
// ─────────────────────────────────────────────────────────

export type InteractionMode =
  | "cold_exec"           // Direct strategic / board / high-confidence
  | "stressed_supportive" // Chaos, overwhelm, crisis, firefighting
  | "tactical_negotiator" // Active supplier pressure, live negotiation
  | "analytical_exec"     // Data request, benchmarks, numbers-driven
  | "skeptical_buyer"     // Testing, cynical, pushback, doubting
  | "operational_manager" // Reactive ops, process question, low abstraction
  | "mentoring_director"; // Junior buyer, exploratory, low stress learning

// ── Signal patterns ───────────────────────────────────────

const STRESS_SIGNALS = [
  /nie wiem (co|jak|co robić)/i,
  /chaos/i,
  /panika/i,
  /kryzys/i,
  /ratuj(cie|)/i,
  /pilne/i,
  /wszystko się/i,
  /nie dajemy rady/i,
  /overwhelmed/i,
  /everything is (urgent|on fire|falling apart)/i,
  /i don't know (what|where|how)/i,
  /crisis/i,
  /firefighting/i,
  /burning/i,
  /presja (ze strony|zarządu|boardu)/i,
  /deadline za/i,
  /do jutra/i,
  /za tydzień/i,
  /natychmiast/i,
  /asap/i,
  /musimy coś zrobić/i,
];

const NEGOTIATION_PRESSURE_SIGNALS = [
  /dostawca (twierdzi|mówi|grozi|eskaluje|naciska|żąda|wyśle|zagroził)/i,
  /supplier (claims|says|threatens|pushes|demands|escalated)/i,
  /ultimatum/i,
  /podwyżka/i,
  /price increase/i,
  /blef/i,
  /bluff/i,
  /nie zejdą niżej/i,
  /won't go lower/i,
  /oferta ważna do/i,
  /offer expires/i,
  /scarcity/i,
  /mają ograniczone moce/i,
  /last available/i,
  /eskalował do/i,
  /bypassed me/i,
  /ominął mnie/i,
  /presja terminowa/i,
  /deadline pressure/i,
  /zakotwiczył/i,
  /anchor/i,
];

const ANALYTICAL_SIGNALS = [
  /ile (kosztuje|wynosi|jest|będzie)/i,
  /benchmark/i,
  /dane/i,
  /liczby/i,
  /procent/i,
  /ROI/i,
  /EBIT/i,
  /marża/i,
  /savings/i,
  /oszczędności/i,
  /should-cost/i,
  /cost breakdown/i,
  /jak (zmierzyć|policzyć|ocenić|wyliczyć)/i,
  /how (to calculate|to measure|much|many)/i,
  /what (is the|are the) (data|numbers|figures|metrics)/i,
  /KPI/i,
  /wskaźniki/i,
];

const SKEPTICAL_SIGNALS = [
  /nie wierzę/i,
  /don't believe/i,
  /wątpię/i,
  /doubt/i,
  /konsultanci (nigdy|zawsze|zwykle)/i,
  /consultants (never|always|typically)/i,
  /to samo co każdy/i,
  /same as everyone/i,
  /tylko teoria/i,
  /just theory/i,
  /co z tego wynika/i,
  /so what/i,
  /i (co z tego|co mi to daje)/i,
  /dlaczego miałbym/i,
  /why should i/i,
  /prove it/i,
  /udowodnij/i,
  /kolejny doradca/i,
  /another consultant/i,
];

const EXECUTIVE_BOARD_SIGNALS = [
  /zarząd/i,
  /board/i,
  /CEO/i,
  /CFO/i,
  /dyrektor (zarządzający|generalny)/i,
  /MD/i,
  /strategic/i,
  /strategiczn/i,
  /operating model/i,
  /model operacyjny/i,
  /transformation/i,
  /transformacj/i,
  /business case/i,
  /uzasadnienie biznesowe/i,
  /całościow/i,
  /portfolio/i,
  /make or buy/i,
  /make vs buy/i,
  /capex/i,
  /opex/i,
];

const JUNIOR_EXPLORATORY_SIGNALS = [
  /jak zacząć/i,
  /where (to start|do i start|do I begin)/i,
  /co to jest/i,
  /what is/i,
  /czy (mógłbyś|możesz) wyjaśnić/i,
  /can you explain/i,
  /uczę się/i,
  /i'm learning/i,
  /dopiero zaczynam/i,
  /just starting/i,
  /podstawy/i,
  /basics/i,
  /dla kogoś (kto|bez)/i,
  /for someone (who|without)/i,
  /nie mam doświadczenia/i,
  /no experience/i,
  /jak (działa|funkcjonuje)/i,
  /how does .{1,30} work/i,
];

const OPERATIONAL_SIGNALS = [
  /proces/i,
  /procedura/i,
  /zamówienie/i,
  /order/i,
  /faktura/i,
  /invoice/i,
  /ERP/i,
  /SAP/i,
  /workflow/i,
  /approval/i,
  /zatwierdzenie/i,
  /jak (zorganizować|usprawnić|poprawić) (proces|procedurę)/i,
  /jak (szybko|skutecznie) obsłużyć/i,
  /operacyjnie/i,
  /day-to-day/i,
  /codziennie/i,
];

// ── Scoring helper ────────────────────────────────────────

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

// ── Main router ───────────────────────────────────────────

export function detectInteractionMode(
  messages: Array<{ role: string; content: string }>
): InteractionMode {
  // Weight recent messages more heavily
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return "cold_exec";

  // Combined text: last 2 user messages weighted double
  const recentMessages = userMessages.slice(-2);
  const lastMessage = userMessages[userMessages.length - 1]?.content ?? "";
  const combinedText = recentMessages.map((m) => m.content).join(" ") + " " + lastMessage;

  // Score each mode
  const scores: Record<InteractionMode, number> = {
    stressed_supportive: countMatches(combinedText, STRESS_SIGNALS) * 3,
    tactical_negotiator: countMatches(combinedText, NEGOTIATION_PRESSURE_SIGNALS) * 3,
    analytical_exec: countMatches(combinedText, ANALYTICAL_SIGNALS) * 2,
    skeptical_buyer: countMatches(combinedText, SKEPTICAL_SIGNALS) * 2,
    cold_exec: countMatches(combinedText, EXECUTIVE_BOARD_SIGNALS) * 2,
    mentoring_director: countMatches(combinedText, JUNIOR_EXPLORATORY_SIGNALS) * 2,
    operational_manager: countMatches(combinedText, OPERATIONAL_SIGNALS) * 1,
  };

  // Stress overrides — escalate immediately if detected in last message
  const lastLower = lastMessage.toLowerCase();
  if (STRESS_SIGNALS.some((p) => p.test(lastLower))) {
    scores.stressed_supportive += 10;
  }
  if (NEGOTIATION_PRESSURE_SIGNALS.some((p) => p.test(lastLower))) {
    scores.tactical_negotiator += 8;
  }

  // Find winner
  const winner = (Object.entries(scores) as [InteractionMode, number][])
    .sort(([, a], [, b]) => b - a)[0];

  // Default to cold_exec if no signals fire (high-confidence context)
  return winner[1] > 0 ? winner[0] : "cold_exec";
}

// ── Mode → behavioral instructions ───────────────────────

export interface ModeInstructions {
  mode: InteractionMode;
  toneDirective: string;
  lengthDirective: string;
  framingDirective: string;
  empathyStyle: string;
  completenessRule: string;
}

export function getModeInstructions(mode: InteractionMode, isPL: boolean): ModeInstructions {
  const instructions: Record<InteractionMode, ModeInstructions> = {
    cold_exec: {
      mode,
      toneDirective: isPL
        ? "Chłodny, krótki, asymetryczny. Bez tłumaczenia oczywistości."
        : "Cold, brief, asymmetric. Don't explain what's obvious.",
      lengthDirective: "60–100 words max. Executive cadence.",
      framingDirective: isPL
        ? "Business framing tylko przy realnym stake: marża, ryzyko, cash, ciągłość."
        : "Business framing only when stakes are real: margin, risk, cash, continuity.",
      empathyStyle: isPL
        ? "Zero terapii. Diagnoza sytuacji zamiast: 'Tu dostawca próbuje skrócić czas decyzji.'"
        : "Zero therapy. Situation diagnosis instead: 'Supplier is compressing your decision timeline.'",
      completenessRule: "Leave reasoning open. One sharp sentence can be the full answer.",
    },
    stressed_supportive: {
      mode,
      toneDirective: isPL
        ? "Spokojny, stabilizujący, konkretny. Żadnego corporate tone."
        : "Calm, stabilizing, concrete. No corporate tone.",
      lengthDirective: "60–90 words. Short sentences. Clear priority.",
      framingDirective: isPL
        ? "Jeden problem na raz. Nie przytłaczaj. Najpierw co teraz, potem co dalej."
        : "One problem at a time. Don't overwhelm. First: what now. Then: what next.",
      empathyStyle: isPL
        ? "Executive acknowledgment: 'To już wygląda na presję kwartalną.' Nie terapia."
        : "Executive acknowledgment: 'This looks like quarterly pressure.' Not therapy.",
      completenessRule: "Give one clear direction. Don't audit everything at once.",
    },
    tactical_negotiator: {
      mode,
      toneDirective: isPL
        ? "Zimny, precyzyjny, kupieckim głosem. Nie trener — praktyk."
        : "Cold, precise, buyer's voice. Not a trainer — a practitioner.",
      lengthDirective: "50–110 words. Blunt naming + one move.",
      framingDirective: isPL
        ? "Nazwij taktykę dostawcy w pierwszym zdaniu. Potem pozycja lub ruch."
        : "Name the supplier tactic in the first sentence. Then position or move.",
      empathyStyle: isPL
        ? "'Nie odpowiadałbym na to od razu.' / 'To jest moment w którym łatwo przepłacić.' Zero wyjaśniania mechanizmu."
        : "'I wouldn't respond to this immediately.' / 'This is the moment where overpaying happens.' Zero mechanism explanation.",
      completenessRule: "Naming the tactic is enough. Don't close every loop.",
    },
    analytical_exec: {
      mode,
      toneDirective: isPL
        ? "Precyzyjny, oparty na danych, bez generycznych fraz."
        : "Precise, data-grounded, no generic phrases.",
      lengthDirective: "80–130 words. Numbers, benchmarks, specifics.",
      framingDirective: isPL
        ? "Konkretne liczby, zakresy, wskaźniki — nie ogólne stwierdzenia."
        : "Concrete numbers, ranges, metrics — not general statements.",
      empathyStyle: isPL
        ? "Chłodna walidacja: 'To realny poziom dla tej kategorii.' Bez pochwał."
        : "Cold validation: 'That's a realistic range for this category.' No praise.",
      completenessRule: "Complete the data argument. Leave strategic interpretation open.",
    },
    skeptical_buyer: {
      mode,
      toneDirective: isPL
        ? "Zwięzły, konkretny, bez defensywności. Sceptycyzm traktuj jako normę."
        : "Concise, specific, no defensiveness. Treat skepticism as normal.",
      lengthDirective: "50–90 words. Less is more.",
      framingDirective: isPL
        ? "Nie tłumacz wartości — pokaż ją. Konkretny przykład zamiast deklaracji."
        : "Don't explain value — demonstrate it. Concrete example over declaration.",
      empathyStyle: isPL
        ? "Żadnego przekonywania. 'Powiedz mi co konkretnie próbowałeś — ocenisz sam.'"
        : "No convincing. 'Tell me what you tried — you'll judge from there.'",
      completenessRule: "Don't oversell. Leave space for the user to draw conclusions.",
    },
    operational_manager: {
      mode,
      toneDirective: isPL
        ? "Praktyczny, operacyjny, bez strategicznego abstrakcjonizmu."
        : "Practical, operational, no strategic abstraction.",
      lengthDirective: "80–130 words. Clear steps when needed.",
      framingDirective: isPL
        ? "Konkretne działania. Można użyć krótkiej listy (max 3 punkty, bez headerów)."
        : "Concrete actions. Short list allowed (max 3 items, no bold headers).",
      empathyStyle: isPL
        ? "Normalizacja: 'To standardowy problem przy takiej skali zakupów.'"
        : "Normalization: 'That's a standard problem at this procurement scale.'",
      completenessRule: "Complete the tactical answer. Strategic implications can stay open.",
    },
    mentoring_director: {
      mode,
      toneDirective: isPL
        ? "Edukacyjny, ale executive. Bez patronizowania. Peer-level nawet z juniorem."
        : "Educational but executive. No patronizing. Peer-level even with juniors.",
      lengthDirective: "100–140 words. Concept + application.",
      framingDirective: isPL
        ? "Wyjaśnij przez przykład lub konsekwencję biznesową — nie przez definicję."
        : "Explain through example or business consequence — not through definition.",
      empathyStyle: isPL
        ? "Normalizacja z perspektywą: 'Większość kupcow zaczyna właśnie od tego pytania.'"
        : "Normalization with perspective: 'Most buyers start with exactly this question.'",
      completenessRule: "Complete the concept. Leave one open question to prompt thinking.",
    },
  };

  return instructions[mode];
}

// ── Mode-aware business framing trigger ───────────────────

export function shouldAddBusinessFraming(
  mode: InteractionMode,
  text: string
): boolean {
  // Always frame in these modes
  if (mode === "cold_exec" || mode === "analytical_exec") return true;

  // High-stakes signals regardless of mode
  const HIGH_STAKES = [
    /marż|margin/i,
    /CFO|zarząd|board/i,
    /ryzyko dostawcy|supplier risk/i,
    /cash flow/i,
    /EBIT/i,
    /eskalacj|escalat/i,
    /krytyczny.*dostawca|critical.*supplier/i,
    /transformacj|transformation/i,
    /podwyżka|price increase/i,
  ];

  return HIGH_STAKES.some((p) => p.test(text));
}
