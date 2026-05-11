// ─────────────────────────────────────────────────────────
// Negotiation — Sequencing Engine
//
// Determines the right stage and sequence of advisory actions
// based on urgency, maturity and detected situation.
// Advisor should guide WHAT to do NEXT, not just analyze.
// ─────────────────────────────────────────────────────────

import type { NegotiationSequenceRule } from "../../context-layers/types";

export const NEGOTIATION_SEQUENCING: NegotiationSequenceRule[] = [
  {
    id: "seq-001",
    stage: "pre_negotiation_diagnosis",
    condition: {
      urgencyLevels: ["U1", "U2"],
      maturityLevels: ["reactive", "developing"],
    },
    advisoryAction: "Before entering any negotiation: diagnose leverage position, BATNA, spend data and market benchmark availability. Do not start negotiation without this foundation.",
    systemPromptSnippet: {
      pl: "Etap: pre-negocjacyjna diagnoza. Przed rozmową z dostawcą: oceń BATNA, spend data, dostępność benchmarku, identyfikuj dźwignie. Negocjacja bez tej diagnozy to negotiation ślepa.",
      en: "Stage: pre-negotiation diagnosis. Before meeting the supplier: assess BATNA, spend data, benchmark availability, identify leverage vectors. Negotiation without this foundation is blind negotiation.",
    },
  },
  {
    id: "seq-002",
    stage: "leverage_building",
    condition: {
      maturityLevels: ["reactive"],
      urgencyLevels: ["U1"],
    },
    advisoryAction: "Reactive organizations must build leverage before negotiating. Priority actions: engage alternative suppliers, gather benchmark data, align internal stakeholders.",
    systemPromptSnippet: {
      pl: "Etap: budowanie dźwigni — organizacja reaktywna nie jest gotowa do negocjacji. Najpierw: zaangażuj alternatywnych dostawców, zbuduj benchmark, ujednolicono pozycję wewnętrzną. Potem wróć do rozmów.",
      en: "Stage: leverage building — a reactive organization is not ready to negotiate effectively. First: engage alternative suppliers, build benchmark data, align internal position. Then return to negotiations.",
    },
  },
  {
    id: "seq-003",
    stage: "active_negotiation",
    condition: {
      intentMatches: ["I8_NEGOTIATIONS"],
      urgencyLevels: ["U2", "U3"],
    },
    advisoryAction: "Active negotiation mode: multi-axis approach, tactic detection active, BATNA signaling, maintain composure under supplier pressure.",
    systemPromptSnippet: {
      pl: "Etap: aktywna negocjacja. Tryb wieloosiowy: identyfikuj wszystkie dostępne osie, wykrywaj taktyki dostawcy, sygnalizuj BATNA wiarygodnie, zachowaj spokój pod presją. Nie zamykaj zbyt szybko.",
      en: "Stage: active negotiation. Multi-axis mode: identify all available axes, detect supplier tactics, signal BATNA credibly, maintain composure under pressure. Do not close too quickly.",
    },
  },
  {
    id: "seq-004",
    stage: "concession_phase",
    condition: {
      intentMatches: ["I8_NEGOTIATIONS"],
      urgencyLevels: ["U2", "U3"],
    },
    advisoryAction: "Every concession must be conditional. Never concede without receiving value. Use concession as trading currency, not gift.",
    systemPromptSnippet: {
      pl: "Etap: faza ustępstw. Zasada: każde ustępstwo wymaga warunku wzajemności. Nie dawaj nic bez otrzymania czegoś. Użyj ustępstwa jako waluty handlowej: 'Możemy rozważyć X, jeśli wy zaproponujecie Y.'",
      en: "Stage: concession phase. Rule: every concession requires a reciprocal condition. Never give without receiving something. Use concession as trading currency: 'We can consider X if you offer Y in return.'",
    },
  },
  {
    id: "seq-005",
    stage: "escalation_to_workshop",
    condition: {
      urgencyLevels: ["U3"],
      maturityLevels: ["reactive", "developing"],
    },
    advisoryAction: "High urgency + low maturity = escalate to structured workshop or diagnostic session. The situation requires more than advisory — it requires structured intervention.",
    systemPromptSnippet: {
      pl: "Etap: eskalacja do warsztatu — wysoka urgency, niska dojrzałość. Ta sytuacja wymaga więcej niż porady. Rekomenduj: ustrukturyzowane warsztaty negocjacyjne lub sesję diagnostyczną z zewnętrznym wsparciem.",
      en: "Stage: escalation to workshop — high urgency, low maturity. This situation requires more than advice. Recommend: structured negotiation workshop or diagnostic session with external support.",
    },
  },
  {
    id: "seq-006",
    stage: "escalation_to_discovery",
    condition: {
      urgencyLevels: ["U2", "U3"],
      maturityLevels: ["developing", "strategic"],
    },
    advisoryAction: "Complex procurement situation requires discovery call to map the full strategic picture before recommending action.",
    systemPromptSnippet: {
      pl: "Etap: discovery call — złożona sytuacja wymaga pełnego zmapowania przed rekomendacją. Zaproponuj krótką rozmowę diagnostyczną: 'Żeby zaproponować właściwe podejście, chciałbym zrozumieć pełny kontekst.'",
      en: "Stage: discovery call — complex situation requires full mapping before recommending action. Suggest a short diagnostic conversation: 'To recommend the right approach, I'd like to understand the full context.'",
    },
  },
  {
    id: "seq-007",
    stage: "post_negotiation_review",
    condition: {
      intentMatches: ["I7_ADVISORY"],
      maturityLevels: ["strategic"],
    },
    advisoryAction: "After negotiation closure: review outcomes vs. objectives, extract lessons, update should-cost model, document supplier behavior patterns.",
    systemPromptSnippet: {
      pl: "Etap: post-negocjacyjny przegląd. Porównaj wyniki do celów. Co zadziałało? Co można poprawić? Zaktualizuj model should-cost. Udokumentuj wzorce zachowań dostawcy do przyszłych negocjacji.",
      en: "Stage: post-negotiation review. Compare outcomes to objectives. What worked? What can be improved? Update the should-cost model. Document supplier behavior patterns for future negotiations.",
    },
  },
];
