// ─────────────────────────────────────────────────────────
// Negotiation — Power Dynamics
//
// Detects power imbalance signals and adjusts advisory tone.
// Buyer power vs. supplier power — who holds structural advantage,
// and what should the advisor recommend given the imbalance.
// ─────────────────────────────────────────────────────────

import type { PowerDynamicsEntry } from "../../context-layers/types";

export const POWER_DYNAMICS: PowerDynamicsEntry[] = [
  {
    id: "pd-001",
    imbalance: "supplier_dominance",
    detectionSignals: [
      "supplier is market leader with few credible alternatives",
      "supplier openly references other customers bidding higher",
      "supplier sets terms and buyer negotiates within those terms",
      "supplier frequently delays or deprioritizes meetings",
    ],
    advisoryApproach: "Do not negotiate from a position of dominance without preparation. Focus on: (1) building a credible alternative — even if it takes time, (2) negotiating shorter contract duration to create future leverage, (3) avoiding commitments that deepen dependency.",
    systemPromptSnippet: {
      pl: "Dominacja dostawcy — strukturalna nierównowaga sił. Nie negocjuj bez przygotowania. Priorytet: (1) zbuduj wiarygodną alternatywę — nawet jeśli to potrwa, (2) negocjuj krótsze kontrakty — nie pogłębiaj uzależnienia, (3) unikaj commitments, które zwiększają dependency.",
      en: "Supplier dominance — structural power imbalance. Do not negotiate without preparation. Priority: (1) build a credible alternative — even if it takes time, (2) negotiate shorter contracts — do not deepen dependency, (3) avoid commitments that increase strategic lock-in.",
    },
  },
  {
    id: "pd-002",
    imbalance: "buyer_weakness",
    detectionSignals: [
      "buyer organization has no clear procurement strategy",
      "no benchmarks, no spend data, no supplier alternatives",
      "negotiations start without defined objectives or BATNA",
      "buyer team lacks procurement expertise",
    ],
    advisoryApproach: "Acknowledge the weakness. Rebuild negotiation structure: stop, gather intelligence, define objectives and BATNA, then re-enter. Never negotiate without basic market visibility.",
    systemPromptSnippet: {
      pl: "Słabość kupującego — brak struktury, danych i strategii. STOP. Nie wchodź do negocjacji bez: benchmarku, zdefiniowanego BATNA, jasnych celów. Najpierw gathering intelligence — potem rozmowy. Negocjacja bez przygotowania to strata wartości.",
      en: "Buyer weakness — lack of structure, data and strategy. STOP. Do not enter negotiations without: a benchmark, a defined BATNA, clear objectives. Intelligence gathering first — conversations second. Negotiation without preparation is value destruction.",
    },
  },
  {
    id: "pd-003",
    imbalance: "internal_fragmentation",
    detectionSignals: [
      "multiple internal stakeholders giving suppliers contradictory signals",
      "operations or business units negotiating directly with suppliers",
      "no single procurement authority governing supplier discussions",
      "supplier plays internal stakeholders against each other",
    ],
    advisoryApproach: "Consolidate internal negotiation authority before engaging supplier. Supplier fragmentation exploitation is one of the most common and damaging power imbalances.",
    systemPromptSnippet: {
      pl: "Fragmentacja wewnętrzna — dostawca gra na braku spójności kupującego. Najpierw: ujednolicenie pozycji wewnętrznej i jednego punktu kontaktu. Dostawca, który może rozmawiać z wieloma osobami niezależnie, zawsze wygra. Koordynacja przed rozmowami.",
      en: "Internal fragmentation — supplier is exploiting buyer inconsistency. First: align internal position and establish a single point of contact. A supplier who can speak to multiple stakeholders independently will always win. Coordination before conversations.",
    },
  },
  {
    id: "pd-004",
    imbalance: "budget_panic",
    detectionSignals: [
      "procurement is under pressure to close deal before end of budget period",
      "financial constraints creating urgency to accept supplier terms",
      "budget deadline being used as justification for poor commercial decision",
    ],
    advisoryApproach: "Separate budget timeline from commercial decision quality. If timeline forces a short-term decision, negotiate a bridge arrangement — not a long-term contract at bad terms.",
    systemPromptSnippet: {
      pl: "Budget panic — deadline budżetowy tworzy presję na złą decyzję komercyjną. Oddziel: jeśli musisz coś kupić teraz — kup na krótki most arrangement. Ale nie podpisuj długoterminowego kontraktu pod presją budżetową bez negocjacji.",
      en: "Budget panic — budget deadline is creating pressure for a poor commercial decision. Separate: if you must purchase now — do it as a short-term bridge arrangement. But do not sign a long-term contract under budget pressure without negotiation.",
    },
  },
  {
    id: "pd-005",
    imbalance: "operational_dependency",
    detectionSignals: [
      "operations cannot run without this specific supplier's output",
      "switching would require plant modifications or system integration changes",
      "supplier's product is deeply embedded in buyer's production process",
    ],
    advisoryApproach: "Acknowledge operational dependency. Medium-term strategy: specification review for alternatives, pilot alternative supplier on partial volume. Short-term: negotiate shorter contract duration, exit clauses, and SLA protection.",
    systemPromptSnippet: {
      pl: "Zależność operacyjna — produkcja zależy od tego dostawcy. Krótkoterminowo: negocjuj ochronę SLA, klauzule wyjścia, krótszy kontrakt. Średnioterminowo: przegląd specyfikacji dla alternatyw, pilotaż alternatywnego dostawcy na części wolumenu. Nie zostawiaj tej zależności nieadresowanej.",
      en: "Operational dependency — production depends on this supplier. Short-term: negotiate SLA protection, exit clauses, shorter contract. Medium-term: specification review for alternatives, pilot alternative supplier on partial volume. Do not leave this dependency unaddressed.",
    },
  },
  {
    id: "pd-006",
    imbalance: "executive_pressure",
    detectionSignals: [
      "executive is pushing procurement to approve supplier terms quickly",
      "decision being escalated over procurement's commercial recommendation",
      "relationship between executive and supplier used to override analysis",
    ],
    advisoryApproach: "Quantify the commercial impact of accepting terms. Present to executive with financial context. Procurement must make the cost of compliance visible — not just recommend against.",
    systemPromptSnippet: {
      pl: "Presja zarządu — executive naciska na akceptację warunków. Odpowiedź procurement: skwantyfikuj finansowy koszt akceptacji i przedstaw zarządowi. Nie tylko 'rekomendujemy odrzucenie' — ale 'akceptacja tych warunków kosztuje X rocznie przez Y lat.' Liczby zmieniają perspektywę.",
      en: "Executive pressure — executive is pushing for acceptance of supplier terms. Procurement response: quantify the financial cost of acceptance and present to the executive with full context. Not just 'we recommend rejecting' — but 'accepting these terms costs X per year over Y years.' Numbers change perspective.",
    },
  },
  {
    id: "pd-007",
    imbalance: "low_visibility",
    detectionSignals: [
      "no spend data available for this category",
      "historical pricing not tracked",
      "no benchmark or market reference available",
      "supplier knows pricing history better than buyer",
    ],
    advisoryApproach: "Visibility is the foundation of negotiation power. Before negotiating: gather spend data, historical pricing, market references. Information asymmetry always favors the supplier.",
    systemPromptSnippet: {
      pl: "Niska visibility — dostawca wie więcej o cenach niż kupujący. Najpierw: zebranie danych (spend history, historical prices, market references). Asymetria informacyjna zawsze faworyzuje dostawcę. Nie wchodź do negocjacji bez podstawowej widoczności.",
      en: "Low visibility — the supplier knows more about pricing than the buyer. First: gather data (spend history, historical prices, market references). Information asymmetry always favors the supplier. Do not enter negotiations without basic market visibility.",
    },
  },
];
