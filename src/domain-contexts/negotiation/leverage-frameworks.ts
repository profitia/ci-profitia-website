// ─────────────────────────────────────────────────────────
// Negotiation — Leverage Frameworks
//
// Encodes real sources of negotiation power.
// The advisor identifies ACTUAL leverage, not theoretical leverage.
// LeverageVector → detected → systemPromptSnippet injected.
// ─────────────────────────────────────────────────────────

import type { LeverageVector } from "../../context-layers/types";

export const LEVERAGE_VECTORS: LeverageVector[] = [
  {
    id: "lev-001",
    type: "market_alternatives",
    description: "Existence of qualified alternative suppliers in the market reduces supplier power significantly.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I5_SOURCING"] },
    diagnosticQuestion: {
      pl: "Czy macie zidentyfikowanych alternatywnych dostawców, którzy mogliby przejąć ten wolumen w rozsądnym czasie?",
      en: "Have you identified qualified alternative suppliers who could absorb this volume within a reasonable timeframe?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: alternatywni dostawcy. Zanim negocjujesz — zidentyfikuj realne alternatywy i daj dostawcy to odczuć (bez ujawniania szczegółów). Alternatywa nie musi być idealna — musi być wiarygodna.",
      en: "Leverage: market alternatives. Before negotiating — identify real alternatives and make the supplier aware of this (without revealing specifics). The alternative need not be perfect — it must be credible.",
    },
  },
  {
    id: "lev-002",
    type: "spend_concentration",
    description: "Significant share of spend with one supplier creates mutual dependency — usable as leverage.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS"] },
    diagnosticQuestion: {
      pl: "Jaki procent waszego spends trafia do tego dostawcy i ile to stanowi dla jego biznesu?",
      en: "What percentage of your spend goes to this supplier, and how significant is your business to their revenue?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: koncentracja wolumenu. Jeśli jesteś znaczącym klientem dla dostawcy — twoja siła negocjacyjna jest wyższa niż myślisz. Kwantyfikuj to przed rozmową.",
      en: "Leverage: spend concentration. If you are a significant customer for the supplier — your negotiation power is higher than you realize. Quantify this before the conversation.",
    },
  },
  {
    id: "lev-003",
    type: "payment_terms",
    description: "Payment terms are a silent negotiation lever — early payment can be exchanged for price reduction.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS"] },
    diagnosticQuestion: {
      pl: "Jakie są obecne warunki płatności i czy dostawca ma problemy z płynnością lub typowe dla branży skrócone terminy?",
      en: "What are the current payment terms, and does the supplier face liquidity pressure or shorter industry standard terms?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: warunki płatności. Skrócenie terminu płatności lub przedpłata mogą być wymienione na obniżkę ceny lub lepsze warunki — bez zmiany wolumenu.",
      en: "Leverage: payment terms. Shorter payment terms or early payment can be exchanged for a price reduction or better conditions — without changing volume.",
    },
  },
  {
    id: "lev-004",
    type: "volume_optionality",
    description: "Ability to increase or redirect volume gives the buyer optionality during negotiation.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I5_SOURCING"] },
    diagnosticQuestion: {
      pl: "Czy jesteście w stanie wiarygodnie zaproponować wzrost wolumenu w zamian za lepsze warunki cenowe?",
      en: "Are you in a position to credibly offer volume growth in exchange for better pricing conditions?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: optionality wolumenowa. Warunkowy wzrost wolumenu ('jeśli osiągniemy X warunki, możemy przenieść wolumen Y') to klasyczna i skuteczna oś negocjacyjna.",
      en: "Leverage: volume optionality. Conditional volume growth ('if we reach X conditions, we can transfer volume Y') is a classic and effective negotiation axis.",
    },
  },
  {
    id: "lev-005",
    type: "benchmark_data",
    description: "Having market benchmark data breaks the information asymmetry that suppliers rely on.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS", "I2_FORECASTING"] },
    diagnosticQuestion: {
      pl: "Czy macie aktualne dane benchmarkingowe lub should-cost dla tej kategorii?",
      en: "Do you have current benchmarking data or a should-cost model for this category?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: dane benchmarkingowe. Twardy benchmark eliminuje subjectivity i zmusza dostawcę do obrony konkretnych liczb — nie narracji. To jedna z najpotężniejszych dźwigni w negocjacjach B2B.",
      en: "Leverage: benchmark data. A hard benchmark eliminates subjectivity and forces the supplier to defend specific numbers — not narratives. This is one of the most powerful levers in B2B negotiations.",
    },
  },
  {
    id: "lev-006",
    type: "contract_terms",
    description: "Contractual flexibility on duration, exclusivity, indexation and SLA creates leverage axes.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I5_SOURCING"] },
    diagnosticQuestion: {
      pl: "Które elementy kontraktu są dla dostawcy operacyjnie najważniejsze — czas trwania, exclusivity, indexacja?",
      en: "Which contractual elements are most operationally important for the supplier — duration, exclusivity, indexation clauses?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: warunki kontraktowe. Negocjuj wieloosiowo: czas trwania umowy, indexacja, exclusivity, kary, SLA — każdy z tych elementów ma wartość dla dostawcy i może być wymieniony za obniżkę ceny.",
      en: "Leverage: contract terms. Negotiate multi-axis: contract duration, indexation, exclusivity, penalties, SLA — each of these has value for the supplier and can be exchanged for price reduction.",
    },
  },
  {
    id: "lev-007",
    type: "timing_advantage",
    description: "Negotiating at the right moment in the supplier's business cycle creates structural advantage.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS"] },
    diagnosticQuestion: {
      pl: "Kiedy kończy się rok finansowy dostawcy i czy negocjujemy w momencie ich presji budżetowej?",
      en: "When does the supplier's fiscal year end, and are we negotiating during their budget pressure period?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: timing. Koniec kwartału/roku finansowego dostawcy to moment największej presji na realizację targetów — wzmacnia twoją pozycję negocjacyjną bez dodatkowych działań.",
      en: "Leverage: negotiation timing. The end of the supplier's quarter or fiscal year creates budget pressure — this strengthens your position without any additional action on your part.",
    },
  },
  {
    id: "lev-008",
    type: "logistics_participation",
    description: "Offering logistics participation or incoterms shift can be traded for price improvement.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS"] },
    diagnosticQuestion: {
      pl: "Czy możecie przejąć część logistyki lub zmienić warunki dostawy (Incoterms) w zamian za lepszą cenę?",
      en: "Could you absorb part of the logistics or shift Incoterms in exchange for a better unit price?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: logistyka. Zmiana warunków dostawy lub przejęcie transportu przez kupującego może wygenerować oszczędności bez bezpośredniej walki o cenę jednostkową.",
      en: "Leverage: logistics participation. Shifting delivery terms or absorbing transport can generate savings without directly fighting over unit price.",
    },
  },
  {
    id: "lev-009",
    type: "specification_flexibility",
    description: "Ability to modify specifications reduces supplier's cost base and creates room for price reduction.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS", "I1_SAVINGS"] },
    diagnosticQuestion: {
      pl: "Czy specyfikacja produktu/usługi jest technicznie sztywna czy jest przestrzeń na optymalizację, która obniżyłaby koszt dostawcy?",
      en: "Is the product/service specification technically fixed, or is there room for optimization that would reduce the supplier's cost base?",
    },
    systemPromptSnippet: {
      pl: "Dźwignia: elastyczność specyfikacji. Value engineering — wspólne przeglądy specyfikacji z dostawcą — mogą ujawnić oszczędności bez obniżenia jakości i bez klasycznej walki cenowej.",
      en: "Leverage: specification flexibility. Value engineering — joint specification reviews with the supplier — can reveal savings without quality reduction and without a classic price fight.",
    },
  },
  {
    id: "lev-010",
    type: "multi_axis_negotiation",
    description: "Negotiating only on price is the weakest negotiation approach. Multiple axes create value and pressure simultaneously.",
    activationCondition: { intentMatches: ["I8_NEGOTIATIONS"] },
    diagnosticQuestion: {
      pl: "Jakie osie negocjacyjne poza ceną jednostkową są dostępne w tej transakcji?",
      en: "What negotiation axes beyond unit price are available in this deal?",
    },
    systemPromptSnippet: {
      pl: "Strategia wieloosiowa: nigdy nie negocjuj tylko ceny. Zidentyfikuj wszystkie osie: cena, wolumen, warunki płatności, logistyka, indexacja, jakość, SLA, exclusivity. Każda oś to potencjalny wartościowy trade.",
      en: "Multi-axis strategy: never negotiate only on price. Identify all available axes: price, volume, payment terms, logistics, indexation, quality, SLA, exclusivity. Each axis is a potential value trade.",
    },
  },
];
