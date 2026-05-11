// ─────────────────────────────────────────────────────────
// Negotiation — BATNA Intelligence
//
// Encodes BATNA assessment: what is the buyer's real alternative,
// how strong is it, and how does BATNA strength change advisory tone.
//
// BATNA = Best Alternative To Negotiated Agreement
// Strong BATNA → push harder. Weak BATNA → build leverage first.
// ─────────────────────────────────────────────────────────

import type { BATNAIntelligenceEntry } from "../../context-layers/types";

export const BATNA_INTELLIGENCE: BATNAIntelligenceEntry[] = [
  {
    id: "batna-001",
    scenario: "strong_batna_credible_alternatives",
    baTNAStrength: "strong",
    diagnosticSignals: [
      "multiple qualified alternative suppliers available",
      "RFQ process has already returned competitive offers",
      "supplier is aware of competitive alternatives",
      "switching timeline is manageable",
    ],
    advisory: "Leverage your BATNA actively. Make the supplier understand alternatives exist without revealing specifics. Push on price and conditions — your walk-away position is real.",
    systemPromptSnippet: {
      pl: "BATNA: silna — masz wiarygodne alternatywy. Używaj tego aktywnie. Dostawca nie musi znać szczegółów — musi wiedzieć, że jesteś gotowy odejść. Negocjuj twardo: twoja pozycja walk-away jest realna.",
      en: "BATNA: strong — you have credible alternatives. Use this actively. The supplier does not need to know specifics — they need to know you are prepared to walk away. Negotiate firmly: your walk-away position is real.",
    },
  },
  {
    id: "batna-002",
    scenario: "moderate_batna_one_qualified_alternative",
    baTNAStrength: "moderate",
    diagnosticSignals: [
      "one or two qualified alternatives exist but with switching costs",
      "alternative supplier is smaller or has capacity limitations",
      "switching would require 2-4 months of qualification",
    ],
    advisory: "Your BATNA gives you leverage but requires investment to execute. Signal the alternative credibly. Consider beginning qualification process as a visible action.",
    systemPromptSnippet: {
      pl: "BATNA: umiarkowana — alternatywa istnieje, ale z kosztami przejścia. Użyj jej jako credible signal. Rozważ: rozpocznij proces kwalifikacji alternatywy — sam sygnał o postępie wzmacnia twoją pozycję bez konieczności zmiany.",
      en: "BATNA: moderate — alternative exists but with switching costs. Use it as a credible signal. Consider: begin the qualification process for the alternative — the signal of progress alone strengthens your position without requiring actual change.",
    },
  },
  {
    id: "batna-003",
    scenario: "weak_batna_no_qualified_alternatives",
    baTNAStrength: "weak",
    diagnosticSignals: [
      "single source with no short-term alternative",
      "switching would take over 6 months",
      "supplier knows they are single source",
      "category is highly specialized or custom",
    ],
    advisory: "Do not negotiate from weakness without addressing the BATNA gap first. Begin supplier diversification immediately. Negotiate shorter contract terms to create future optionality. Avoid long-term commitments that lock in poor pricing.",
    systemPromptSnippet: {
      pl: "BATNA: słaba — single source bez wiarygodnej alternatywy. NIE negocjuj z tej pozycji bez przygotowania. Priorytet: rozpocznij dywersyfikację dostawców. W negocjacjach: krótsze kontrakty, klauzule wyjścia, unikaj długoterminowego lockinu w złych warunkach.",
      en: "BATNA: weak — single source with no credible alternative. Do NOT negotiate from this position without preparation. Priority: begin supplier diversification. In negotiations: shorter contracts, exit clauses, avoid long-term lock-in at poor conditions.",
    },
  },
  {
    id: "batna-004",
    scenario: "fake_batna_buyer_bluffing",
    baTNAStrength: "weak",
    diagnosticSignals: [
      "buyer is claiming alternatives exist but they have not been qualified",
      "supplier may suspect the BATNA is not real",
      "buyer is reluctant to take steps that would make the alternative real",
    ],
    advisory: "Fake BATNA is dangerous — if called, it collapses your position. Either make the BATNA real (begin qualification) or do not use it as explicit leverage. Credibility is more valuable than the bluff.",
    systemPromptSnippet: {
      pl: "Uwaga: fake BATNA — deklarujesz alternatywę, która nie jest wiarygodna. To ryzykowne: jeśli dostawca sprawdzi, twoja pozycja się załamuje. Zrób BATNA prawdziwą: zacznij kwalifikację alternatywy, lub nie używaj jej explicite jako dźwigni.",
      en: "Warning: fake BATNA — you are claiming an alternative that is not credible. This is risky: if the supplier tests it, your position collapses. Make the BATNA real: begin qualifying the alternative, or do not use it explicitly as leverage.",
    },
  },
  {
    id: "batna-005",
    scenario: "supplier_batna_assessment",
    baTNAStrength: "unknown",
    diagnosticSignals: [
      "unclear how dependent the supplier is on this contract",
      "supplier may have many alternative buyers or be highly dependent",
      "supplier's capacity utilization unknown",
    ],
    advisory: "Assess the supplier's BATNA too. What is their alternative if this deal falls through? A supplier at high capacity utilization has a different BATNA than one with excess capacity.",
    systemPromptSnippet: {
      pl: "Oceń BATNA dostawcy: co traci, jeśli ten kontrakt nie zostanie podpisany? Dostawca z nadwyżką mocy ma inne BATNA niż dostawca przy pełnym obłożeniu. Ta asymetria określa siłę twojej pozycji negocjacyjnej.",
      en: "Assess the supplier's BATNA: what do they lose if this deal falls through? A supplier with excess capacity has a different BATNA than one operating at full utilization. This asymmetry defines the strength of your negotiation position.",
    },
  },
];
