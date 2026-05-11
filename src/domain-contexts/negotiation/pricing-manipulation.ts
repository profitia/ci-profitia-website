// ─────────────────────────────────────────────────────────
// Negotiation — Pricing Manipulation Intelligence
//
// Encodes how suppliers manipulate pricing narratives.
// The advisor identifies the manipulation type, challenges it
// with should-cost logic and directs the right counter-approach.
// ─────────────────────────────────────────────────────────

import type { PriceManipulationPattern } from "../../context-layers/types";

export const PRICE_MANIPULATION_PATTERNS: PriceManipulationPattern[] = [
  {
    id: "pm-001",
    type: "unjustified_increase",
    detectionSignals: [
      "supplier requests price increase without cost driver breakdown",
      "increase percentage significantly exceeds known commodity/labor movements",
      "previous year had increase as well without clear justification",
    ],
    challengeApproach: "Request formal cost driver decomposition. Apply actual market indices. Calculate justified vs. unjustified increase. Present the gap as the negotiation target.",
    systemPromptSnippet: {
      pl: "Wykryto: nieuzasadniona podwyżka — brak dekompozycji kosztowej. Odpowiedź: żądaj formal breakdown na składniki (surowce, energia, praca, transport, overhead, marża). Następnie zastosuj rynkowe indeksy. Różnica między żądaną a uzasadnioną podwyżką to twój cel negocjacyjny.",
      en: "Detected: unjustified increase — no cost decomposition provided. Response: demand a formal cost breakdown (raw materials, energy, labor, transport, overhead, margin). Then apply market indices to each component. The gap between requested and justified increase is your negotiation target.",
    },
  },
  {
    id: "pm-002",
    type: "index_misuse",
    detectionSignals: [
      "supplier cites a single index (e.g., CPI) for a complex cost structure",
      "index is applied to total price, not to the relevant cost component only",
      "index selected shows highest movement, while alternatives show stability",
    ],
    challengeApproach: "Identify the correct index for each cost component. Apply each index proportionally to its weight in the cost structure. Show the actual blended cost movement.",
    systemPromptSnippet: {
      pl: "Wykryto: nadużycie indeksu — dostawca stosuje jeden indeks do całości ceny. Technika: zidentyfikuj właściwy indeks dla każdego kosztu (energia→PZEM, stal→LME, praca→GUS). Zastosuj proporcjonalnie. Pokaż rzeczywisty blended cost movement.",
      en: "Detected: index misuse — supplier applies a single index to the entire price. Technique: identify the correct index for each cost component (energy→power indices, steel→LME, labor→national labor indices). Apply proportionally. Show the actual blended cost movement.",
    },
  },
  {
    id: "pm-003",
    type: "hidden_margin",
    detectionSignals: [
      "supplier refuses to disclose cost structure breakdown",
      "price significantly above should-cost estimate",
      "supplier margin is unusually high for the category",
    ],
    challengeApproach: "Use should-cost model to estimate fair price. Present gap between market-estimated cost and quoted price. Ask the supplier to justify the delta.",
    systemPromptSnippet: {
      pl: "Wykryto: hidden margin — cena znacząco powyżej should-cost. Odpowiedź: przedstaw model should-cost z szacunkowymi kosztami każdego komponentu. Zapytaj dostawcę o uzasadnienie delty: 'Nasz model sugeruje koszt produkcji X. Jakie elementy wyjaśniają różnicę do waszej ceny?'",
      en: "Detected: hidden margin — price significantly above should-cost estimate. Response: present a should-cost model with estimated costs for each component. Ask the supplier to justify the delta: 'Our model suggests a production cost of X. What elements explain the difference to your price?'",
    },
  },
  {
    id: "pm-004",
    type: "cost_inflation_narrative",
    detectionSignals: [
      "supplier uses emotional language about cost pressures",
      "narrative includes broad industry suffering without specific data",
      "increase framed as survival necessity rather than market reality",
    ],
    challengeApproach: "Acknowledge the narrative. Redirect to data: 'We understand the context — let's work from actual numbers.' Present independent market data.",
    systemPromptSnippet: {
      pl: "Wykryto: cost inflation narrative — dostawca buduje emocjonalną narrację o presji kosztowej zamiast danych. Odpowiedź: 'Rozumiemy kontekst rynkowy. Czy możemy przejść do konkretnych danych cost-driver?' Narracja nie zastępuje dowodów w negocjacjach.",
      en: "Detected: cost inflation narrative — supplier builds an emotional narrative about cost pressure instead of data. Response: 'We understand the market context. Can we move to specific cost-driver data?' A narrative does not substitute for evidence in a negotiation.",
    },
  },
  {
    id: "pm-005",
    type: "asymmetric_cost_pass_through",
    detectionSignals: [
      "costs passed to buyer when commodity prices rise",
      "supplier keeps benefit when commodity prices fall",
      "indexation clause is one-directional only",
    ],
    challengeApproach: "Demand symmetric indexation clauses. 'Any indexation mechanism must work in both directions — increases and decreases.' Build automatic price reduction triggers into the contract.",
    systemPromptSnippet: {
      pl: "Wykryto: asymetryczny cost pass-through — dostawca przerzuca wzrosty kosztów, ale zatrzymuje spadki. Wymagaj symetrycznej klauzuli indexacyjnej: 'Jeśli ceny rosną i przekazujecie nam wzrost — to samo musi działać przy spadkach.' Brak symetrii to ukryta podwyżka strukturalna.",
      en: "Detected: asymmetric cost pass-through — supplier passes cost increases but retains the benefit of decreases. Require a symmetric indexation clause: 'If prices rise and you pass the increase to us — the same mechanism must apply when prices fall.' No symmetry means a hidden structural price increase.",
    },
  },
  {
    id: "pm-006",
    type: "bundled_price_obscurity",
    detectionSignals: [
      "supplier quotes one total price without line-item breakdown",
      "impossible to assess individual component value",
      "comparison with alternatives blocked by bundle structure",
    ],
    challengeApproach: "Demand full line-item pricing. Identify overpriced components. Run separate RFQs for components that can be sourced independently.",
    systemPromptSnippet: {
      pl: "Wykryto: bundled price obscurity — cena ukryta za bundlem, brak line-item breakdown. Wymagaj rozbicia. Który element jest drogi? Co można pozyskać oddzielnie? Unbundling ujawnia rzeczywisty koszt i tworzy przestrzeń negocjacyjną.",
      en: "Detected: bundled price obscurity — pricing hidden within a bundle, no line-item breakdown. Demand decomposition. Which component is overpriced? What can be sourced separately? Unbundling reveals true cost and creates negotiation space.",
    },
  },
  {
    id: "pm-007",
    type: "retroactive_adjustment",
    detectionSignals: [
      "supplier claims right to retroactive price adjustment",
      "invoices do not match agreed pricing",
      "supplier references contract clause allowing retrospective change",
    ],
    challengeApproach: "Challenge the contractual basis immediately. Do not accept retroactive changes without formal documentation and legal review. Use it as a signal of supply relationship risk.",
    systemPromptSnippet: {
      pl: "Wykryto: retroactive adjustment — dostawca domaga się zmian wstecznych. Natychmiast zażądaj podstawy kontraktowej. Nie akceptuj zmian wstecznych bez formalnej dokumentacji i przeglądu prawnego. To poważny sygnał ryzyka w relacji dostawczej.",
      en: "Detected: retroactive price adjustment — supplier demanding retrospective changes. Immediately request the contractual basis. Do not accept retroactive changes without formal documentation and legal review. This is a serious supplier relationship risk signal.",
    },
  },
];
