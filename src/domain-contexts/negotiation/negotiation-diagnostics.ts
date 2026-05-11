// ─────────────────────────────────────────────────────────
// Negotiation — Diagnostics
//
// Sharp 1-2 question diagnostic triggers per scenario.
// The advisor asks maximum 2 questions at a time.
// Long discovery interviews are PROHIBITED.
// Each question reveals something specific and actionable.
// ─────────────────────────────────────────────────────────

import type { NegotiationDiagnostic } from "../../context-layers/types";

export const NEGOTIATION_DIAGNOSTICS: NegotiationDiagnostic[] = [
  {
    id: "diag-001",
    scenario: "supplier_price_increase",
    triggerIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS"],
    questions: {
      primary: {
        pl: "Czy dostawca uzasadnił podwyżkę konkretnymi cost drivers i ich indeksami rynkowymi?",
        en: "Has the supplier justified the increase with specific cost drivers and their corresponding market indices?",
      },
      secondary: {
        pl: "Jaki jest historyczny trend cenowy dla tej kategorii w ostatnich 12 miesiącach?",
        en: "What is the historical pricing trend for this category over the last 12 months?",
      },
    },
    whatToListenFor: "Whether the buyer has or can get benchmark data. Absence of data = leverage gap that must be addressed before negotiation.",
  },
  {
    id: "diag-002",
    scenario: "single_source_dependency",
    triggerIntents: ["I3_SUPPLIER_RISK", "I5_SOURCING", "I8_NEGOTIATIONS"],
    questions: {
      primary: {
        pl: "Jak długo trwałaby kwalifikacja alternatywnego dostawcy i jaki jest szacowany koszt tej zmiany?",
        en: "How long would alternative supplier qualification take, and what is the estimated cost of that switch?",
      },
      secondary: {
        pl: "Czy specyfikacja produktu/usługi jest technicznie sztywna czy jest przestrzeń na alternatywne rozwiązania?",
        en: "Is the product or service specification technically fixed, or is there room for alternative solutions?",
      },
    },
    whatToListenFor: "Real switching cost and timeline. This determines whether BATNA is buildable within the negotiation window.",
  },
  {
    id: "diag-003",
    scenario: "negotiation_preparation",
    triggerIntents: ["I8_NEGOTIATIONS"],
    questions: {
      primary: {
        pl: "Jakie konkretne dźwignie negocjacyjne zostały zidentyfikowane przed rozmową z dostawcą?",
        en: "What specific negotiation leverage points have been identified before the supplier conversation?",
      },
    },
    whatToListenFor: "Whether the buyer has done pre-negotiation homework. No leverage identified = not ready to negotiate.",
  },
  {
    id: "diag-004",
    scenario: "benchmark_availability",
    triggerIntents: ["I1_SAVINGS", "I8_NEGOTIATIONS", "I2_FORECASTING"],
    questions: {
      primary: {
        pl: "Skąd pochodzi benchmark, z którym porównujecie tę cenę — własne dane historyczne, alternatywne oferty czy niezależne źródła rynkowe?",
        en: "What is the source of the benchmark you are comparing this price against — your own historical data, competing offers, or independent market sources?",
      },
    },
    whatToListenFor: "Quality and credibility of the benchmark. Supplier can challenge weak benchmarks. Strong benchmarks are the foundation of negotiation.",
  },
  {
    id: "diag-005",
    scenario: "urgent_negotiation_pressure",
    triggerIntents: ["I8_NEGOTIATIONS"],
    questions: {
      primary: {
        pl: "Jakie są konsekwencje, jeśli negocjacje nie zakończą się w zakładanym terminie — operacyjne, finansowe, kontraktowe?",
        en: "What are the consequences if negotiations do not close within the assumed timeline — operational, financial, contractual?",
      },
    },
    whatToListenFor: "Real vs. artificial urgency. If consequences are not severe, the deadline may be artificial. If severe, a bridge arrangement may be needed.",
  },
  {
    id: "diag-006",
    scenario: "supplier_tactic_detection",
    triggerIntents: ["I8_NEGOTIATIONS"],
    questions: {
      primary: {
        pl: "Jak zachowuje się dostawca podczas rozmów — jakie argumenty podnosi i czy stosuje konkretne techniki presji?",
        en: "How is the supplier behaving during discussions — what arguments are they using, and are they applying specific pressure techniques?",
      },
    },
    whatToListenFor: "Signals of anchoring, artificial urgency, market panic framing, relationship leverage, false scarcity. Identifying the tactic enables a targeted counter-strategy.",
  },
  {
    id: "diag-007",
    scenario: "multi_axis_opportunity",
    triggerIntents: ["I8_NEGOTIATIONS", "I1_SAVINGS"],
    questions: {
      primary: {
        pl: "Czy negocjacje koncentrują się tylko na cenie jednostkowej, czy inne osie (warunki płatności, wolumen, logistyka, indexacja) zostały zidentyfikowane jako dodatkowe lewarze?",
        en: "Are negotiations focused only on unit price, or have other axes (payment terms, volume, logistics, indexation) been identified as additional levers?",
      },
    },
    whatToListenFor: "Whether multi-axis approach is being used. Price-only negotiation leaves value on the table and weakens overall position.",
  },
  {
    id: "diag-008",
    scenario: "executive_advisory",
    triggerIntents: ["I7_ADVISORY"],
    questions: {
      primary: {
        pl: "Jaki jest kluczowy priorytet biznesowy tej transakcji — ochrona marży, ciągłość dostaw, zarządzanie ryzykiem czy optymalizacja kosztów?",
        en: "What is the primary business priority of this transaction — margin protection, supply continuity, risk management or cost optimization?",
      },
    },
    whatToListenFor: "Executive framing priority. This determines which outcomes to protect and which to trade in the negotiation.",
  },
];
