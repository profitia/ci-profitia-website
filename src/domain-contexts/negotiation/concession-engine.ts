// ─────────────────────────────────────────────────────────
// Negotiation — Concession Intelligence
//
// Encodes when concessions should and should not be made.
// Core principle: never concede without receiving value in exchange.
// Concession patterns → detect risk → inject advisory guidance.
// ─────────────────────────────────────────────────────────

import type { ConcessionPattern } from "../../context-layers/types";

export const CONCESSION_PATTERNS: ConcessionPattern[] = [
  {
    id: "con-001",
    risk: "premature_concession",
    description: "Concession made before the supplier's position has been adequately tested or alternative leverage applied.",
    warningSignals: [
      "concession offered in the first or second meeting",
      "concession made without any counter-demand",
      "price reduced 'to show goodwill' before supplier has reciprocated",
    ],
    counterStrategy: "Establish that every concession requires a reciprocal concession. 'We can consider movement on price — if you can commit to payment term extension / volume flexibility / longer contract duration.'",
    systemPromptSnippet: {
      pl: "Ryzyko: przedwczesna ustępstwo — concession zanim pozycja dostawcy była rzeczywiście przetestowana. Zasada: nigdy nie ustępuj bez warunku wzajemności. 'Możemy rozważyć ruch cenowy — jeśli wy zaproponujecie X w zamian.'",
      en: "Risk: premature concession — conceding before the supplier's position has been genuinely tested. Rule: never concede without a reciprocal condition. 'We can consider movement on price — if you can offer X in return.'",
    },
  },
  {
    id: "con-002",
    risk: "value_loss_without_exchange",
    description: "Concession given but no value extracted in return — pure value transfer to supplier.",
    warningSignals: [
      "price improved but no other condition changed",
      "buyer accepted worse terms 'to keep the relationship'",
      "unilateral concession framed as negotiation success",
    ],
    counterStrategy: "Always attach a condition to any concession. If unilateral concession already made, use it as leverage: 'We already moved on price — we need you to move on X now.'",
    systemPromptSnippet: {
      pl: "Ryzyko: ustępstwo bez wymiany — czyste przeniesienie wartości do dostawcy. Sprawdź: co dostałeś w zamian? Jeśli nic — to nie była negocjacja, to było ustępstwo jednostronne. Następny krok: natychmiastowe żądanie wzajemności.",
      en: "Risk: concession without value exchange — pure value transfer to the supplier. Check: what did you receive in return? If nothing — that was not a negotiation, it was a unilateral concession. Next step: immediate demand for reciprocity.",
    },
  },
  {
    id: "con-003",
    risk: "concession_escalation_trap",
    description: "Each concession signals that more concessions are available, inviting the supplier to escalate demands.",
    warningSignals: [
      "supplier keeps returning with new demands after each concession",
      "buyer feels like every concession 'opens a new front'",
      "negotiation never reaches closure despite multiple concessions",
    ],
    counterStrategy: "Explicitly frame the limit: 'This is our final position on X. We will not revisit this.' Signal clearly that the concession is exhausted.",
    systemPromptSnippet: {
      pl: "Ryzyko: pułapka eskalacji — każda concession sygnalizuje, że są kolejne. Dostawca wraca z nowymi żądaniami. Postaw wyraźną granicę: 'To jest nasza finalna pozycja w tym zakresie. Nie wracamy do tego tematu.' Zamknięcie musi być jednoznaczne.",
      en: "Risk: concession escalation trap — each concession signals more are available. Supplier returns with new demands. Set a clear limit: 'This is our final position on this point. We will not revisit it.' The closing signal must be unambiguous.",
    },
  },
  {
    id: "con-004",
    risk: "exhaustion_concession",
    description: "Concession made not from logic but from negotiation fatigue — desire to end the process.",
    warningSignals: [
      "internal team pushing to 'just close' without commercial justification",
      "concession made late in a long negotiation cycle",
      "language: 'let's just get this done' without analysis",
    ],
    counterStrategy: "Pause negotiation. Set a firm deadline. Escalate decision authority. Do not close on exhaustion.",
    systemPromptSnippet: {
      pl: "Ryzyko: exhaustion concession — ustępstwo z wyczerpania, nie z logiki. STOP. Zrób pauzę. Postaw deadline. Eskaluj decision authority. Decyzja podjęta ze zmęczenia to zazwyczaj zła decyzja komercyjna.",
      en: "Risk: exhaustion concession — conceding from fatigue, not from logic. STOP. Pause the negotiation. Set a firm deadline. Escalate decision authority. A decision made from exhaustion is almost always a poor commercial decision.",
    },
  },
  {
    id: "con-005",
    risk: "anchoring_concession",
    description: "Buyer concedes from the supplier's anchor point rather than from their own market-based starting position.",
    warningSignals: [
      "buyer's initial counter-offer is based on supplier's opening price",
      "buyer is 'negotiating towards the middle' of a range the supplier set",
      "internal discussions focus on 'how much to reduce supplier's price by'",
    ],
    counterStrategy: "Reject the anchor. Present your own market-based reference point. Negotiate from your benchmark, not theirs.",
    systemPromptSnippet: {
      pl: "Ryzyko: ustępstwo od kotwicy dostawcy — negocjujesz od ich punktu startowego, nie od twojego benchmarku. Odrzuć kotwicę: 'Naszą bazą negocjacyjną są dane rynkowe, nie wasza propozycja.' Zacznij od własnej liczby opartej na should-cost.",
      en: "Risk: anchoring concession — negotiating from the supplier's reference point instead of your market benchmark. Reject the anchor: 'Our negotiation basis is market data, not your proposal.' Start from your own number based on should-cost.",
    },
  },
  {
    id: "con-006",
    risk: "panic_concession",
    description: "Concession driven by fear of supply disruption or deadline rather than commercial analysis.",
    warningSignals: [
      "urgency language in internal discussions about accepting terms",
      "operational deadline creating pressure to close at any price",
      "risk of production stop cited as justification for poor terms",
    ],
    counterStrategy: "Separate the operational urgency from the commercial decision. If supply must be secured, do it — but negotiate the longer-term contract simultaneously, separately.",
    systemPromptSnippet: {
      pl: "Ryzyko: panic concession — ustępstwo z lęku przed przerwą w dostawach. Oddziel decyzję operacyjną od komercyjnej: jeśli dostawy muszą być zabezpieczone — zrób to, ale negocjuj długoterminowy kontrakt oddzielnie, bez presji czasu.",
      en: "Risk: panic concession — conceding from fear of supply disruption. Separate the operational decision from the commercial one: if supply must be secured — do it, but negotiate the long-term contract separately, without time pressure.",
    },
  },
  {
    id: "con-007",
    risk: "relationship_concession",
    description: "Concession made to preserve relationship or avoid conflict, not because it is commercially justified.",
    warningSignals: [
      "'we don't want to damage the relationship'",
      "'they've been good partners, we should give them this'",
      "relationship history overrides commercial analysis",
    ],
    counterStrategy: "Frame firm negotiation as the foundation of sustainable partnerships. 'Good partnerships are built on fair commercial terms — not on one side consistently underperforming.'",
    systemPromptSnippet: {
      pl: "Ryzyko: relationship concession — ustępstwo 'dla relacji'. Korekta framing: 'Dobre partnerstwo buduje się na uczciwych warunkach komercyjnych — nie na tym, że jedna strona stale płaci więcej niż rynek.' Relacja i warunki rynkowe nie są sprzeczne.",
      en: "Risk: relationship concession — conceding 'for the relationship'. Reframe: 'Good partnerships are built on fair commercial terms — not on one side consistently paying above market.' Relationship and market terms are not in conflict.",
    },
  },
];
