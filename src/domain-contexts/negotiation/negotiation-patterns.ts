// ─────────────────────────────────────────────────────────
// Negotiation — Supplier Tactic Patterns
//
// Encodes known supplier pressure tactics.
// The advisor DIAGNOSES the tactic, names it, then guides
// the counter-move. NOT generic advice — specific patterns.
// ─────────────────────────────────────────────────────────

import type { SupplierTacticPattern } from "../../context-layers/types";

export const SUPPLIER_TACTIC_PATTERNS: SupplierTacticPattern[] = [
  {
    id: "tac-001",
    tactic: "anchoring",
    description: "Supplier opens with an extreme initial price to set a reference point that biases the final outcome.",
    detectionSignals: [
      "supplier opens with a price significantly above market",
      "supplier justifies opening price with vague or unverified data",
      "buyer starts negotiating from supplier's opening position rather than own analysis",
    ],
    counterMoves: [
      "explicitly reject the anchor and name your own number based on benchmark",
      "immediately present market data or should-cost analysis",
      "reframe: 'We don't negotiate from your opening. We negotiate from market evidence.'",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: dostawca stosuje anchoring — otwiera drastycznie wysoką ceną. Nie akceptuj ich kotwicy. Zidentyfikuj własny benchmark i wejdź z kontrpropozycją opartą na danych rynkowych, nie na ich liczbie.",
      en: "Detect: the supplier is anchoring — opening with a dramatically high price. Do not accept their anchor. Establish your own benchmark and counter with market-based evidence, not their number.",
    },
    priority: 90,
  },
  {
    id: "tac-002",
    tactic: "artificial_urgency",
    description: "Supplier creates false time pressure to accelerate buyer decision-making and prevent proper analysis.",
    detectionSignals: [
      "'this price is only valid until end of week'",
      "'we have another buyer interested'",
      "'material costs are rising next month'",
      "deadline given without verifiable justification",
    ],
    counterMoves: [
      "slow down, do not respond to artificial deadlines",
      "ask: 'What specifically changes after that date and can you show documentation?'",
      "use the deadline as leverage: 'Then we need to accelerate our benchmarking process too'",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: sztuczna urgency — dostawca wywiera presję czasową bez uzasadnienia. Spowolnij. Zapytaj o konkretne dowody. Nie podejmuj decyzji pod presją czasu, której nie możesz zweryfikować.",
      en: "Detect: artificial urgency — supplier is applying time pressure without verifiable justification. Slow down. Ask for specific evidence. Do not make decisions under pressure you cannot verify.",
    },
    priority: 85,
  },
  {
    id: "tac-003",
    tactic: "market_panic_framing",
    description: "Supplier frames market conditions as uniquely dire to justify price increases that may not be market-validated.",
    detectionSignals: [
      "'everyone in the market is raising prices'",
      "'global supply shortages are forcing us to...'",
      "'the war/crisis/disruption means we have no choice'",
      "broad market claims without specific index data",
    ],
    counterMoves: [
      "request specific cost driver data and market indices",
      "check whether all suppliers in the category are increasing by the same amount",
      "separate market narrative from verified cost reality",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: market panic framing — dostawca używa szerokich narracji rynkowych zamiast konkretnych cost drivers. Zapytaj: 'Który konkretny indeks kosztowy wzrósł i o ile?' Narracja to nie dane.",
      en: "Detect: market panic framing — supplier uses broad market narratives instead of specific cost drivers. Ask: 'Which specific cost index increased and by how much?' Narrative is not data.",
    },
    priority: 85,
  },
  {
    id: "tac-004",
    tactic: "inflation_manipulation",
    description: "Supplier uses inflation as a blanket justification for price increases that exceed actual cost impact.",
    detectionSignals: [
      "price increase cited as 'inflation adjustment' without decomposition",
      "percentage increase higher than relevant commodity or labor indices",
      "inflation cited uniformly across all cost components",
    ],
    counterMoves: [
      "decompose the supplier's cost structure: raw material, labor, energy, transport, overhead",
      "apply actual indices to each cost driver",
      "calculate justified vs. unjustified increase portion",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: inflation manipulation — podwyżka o 'inflację' bez dekompozycji kosztowej. Przeprowadź should-cost: zastosuj rzeczywiste indeksy do każdego cost drivera. Jaka część podwyżki jest uzasadniona, a jaka to ekstra marża?",
      en: "Detect: inflation manipulation — price increase cited as 'inflation' without cost decomposition. Run a should-cost: apply actual indices to each cost driver. What portion of the increase is justified, and what is extra margin capture?",
    },
    priority: 90,
  },
  {
    id: "tac-005",
    tactic: "selective_benchmarking",
    description: "Supplier presents cherry-picked benchmark comparisons that favor their position while hiding unfavorable data.",
    detectionSignals: [
      "supplier presents benchmark data without source or methodology",
      "benchmark sample is too small or non-representative",
      "benchmark excludes markets or suppliers that would show lower prices",
    ],
    counterMoves: [
      "demand full benchmark methodology and data sources",
      "present independent benchmark data",
      "challenge: 'Which markets did your benchmark exclude?'",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: selective benchmarking — dostawca prezentuje wybrane dane, które go faworyzują. Zapytaj o metodologię, źródła i co zostało wyłączone. Niezależny benchmark neutralizuje tę taktykę.",
      en: "Detect: selective benchmarking — supplier presents cherry-picked data that favors their position. Ask about methodology, data sources and what was excluded. An independent benchmark neutralizes this tactic.",
    },
    priority: 80,
  },
  {
    id: "tac-006",
    tactic: "false_scarcity",
    description: "Supplier claims limited capacity or supply availability to artificially increase perceived value.",
    detectionSignals: [
      "'our capacity is fully committed for next quarter'",
      "'we can only guarantee delivery if you sign by...'",
      "'raw material availability is extremely limited'",
      "scarcity claims without supply chain documentation",
    ],
    counterMoves: [
      "independently verify capacity claims with market intelligence",
      "contact alternative suppliers to test actual market availability",
      "ask for written capacity commitment with penalty clause",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: false scarcity — dostawca twierdzi, że moce/materiały są limitowane. Zweryfikuj niezależnie. Skontaktuj się z alternatywnymi dostawcami. Prawdziwa scarcity wymaga dokumentacji, nie tylko deklaracji.",
      en: "Detect: false scarcity — supplier claims limited capacity or materials. Verify independently. Contact alternative suppliers. Real scarcity requires documentation, not just declarations.",
    },
    priority: 80,
  },
  {
    id: "tac-007",
    tactic: "emotional_pressure",
    description: "Supplier uses relationship history, loyalty appeals or emotional language to prevent rational analysis.",
    detectionSignals: [
      "'we've been partners for X years, surely you trust us'",
      "'our team has gone above and beyond for you'",
      "'this is not just a business decision, it's a partnership'",
      "personal relationship invoked to override commercial analysis",
    ],
    counterMoves: [
      "separate commercial analysis from relationship maintenance",
      "acknowledge the relationship while insisting on market-based pricing",
      "'We value the relationship — which is why we want it on sustainable commercial terms for both sides'",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: emotional pressure — dostawca używa historii współpracy lub języka partnerstwa, by blokować analizę komercyjną. Oddziel relację od ceny: 'Doceniamy współpracę, właśnie dlatego chcemy ją oprzeć na trwałych warunkach rynkowych.'",
      en: "Detect: emotional pressure — supplier uses relationship history or partnership language to block commercial analysis. Separate relationship from pricing: 'We value this partnership — which is why we want it built on sustainable market terms.'",
    },
    priority: 75,
  },
  {
    id: "tac-008",
    tactic: "switching_cost_pressure",
    description: "Supplier emphasizes real or exaggerated switching costs to reduce buyer's willingness to explore alternatives.",
    detectionSignals: [
      "'changing suppliers will take 6-12 months of qualification'",
      "'your systems are deeply integrated with ours'",
      "'the transition risk is not worth the savings'",
      "switching timeline inflated beyond industry norms",
    ],
    counterMoves: [
      "independently assess actual switching timeline and cost",
      "begin qualification of alternative suppliers as a credible signal",
      "quantify: switching cost vs. 3-year savings from lower pricing",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: switching cost pressure — dostawca wyolbrzymia koszt zmiany. Oceń realistycznie: ile faktycznie trwa kwalifikacja alternatywy? Jaki jest koszt vs. oszczędności przez 3 lata? Sama groźba zmiany, jeśli wiarygodna, wzmacnia pozycję.",
      en: "Detect: switching cost pressure — supplier is exaggerating the cost of switching. Assess realistically: how long does alternative qualification actually take? What is the switching cost vs. 3-year savings? The credible threat of switching itself strengthens your position.",
    },
    priority: 85,
  },
  {
    id: "tac-009",
    tactic: "last_chance_framing",
    description: "Supplier frames current offer as the final opportunity before conditions worsen significantly.",
    detectionSignals: [
      "'this is the last price we can offer before the increase takes effect'",
      "'after this contract expires, conditions will be much less favorable'",
      "'we can't hold this price past this week'",
    ],
    counterMoves: [
      "treat the 'last chance' as an artificial construct",
      "ask: 'What exactly changes and can you provide written confirmation of the change drivers?'",
      "signal: you are prepared to wait and explore market alternatives",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: last chance framing — oferta prezentowana jako ostatnia szansa. Nie działaj pod wpływem tej narracji bez weryfikacji. Zapytaj o pisemne potwierdzenie zmiany warunków i przyczyn.",
      en: "Detect: last chance framing — offer presented as the last opportunity before conditions worsen. Do not act on this narrative without verification. Request written confirmation of the change drivers.",
    },
    priority: 80,
  },
  {
    id: "tac-010",
    tactic: "procurement_exhaustion",
    description: "Supplier extends negotiation process deliberately to exhaust the buyer's team and erode their resolve.",
    detectionSignals: [
      "negotiation cycles far longer than typical for the category",
      "repeated small changes that extend the process without resolution",
      "internal stakeholders becoming impatient or disengaged",
      "team starting to accept worse terms just to close",
    ],
    counterMoves: [
      "set a clear negotiation deadline with consequences",
      "reduce number of participants to maintain focus and resolve",
      "escalate decision authority to prevent fatigue-driven concessions",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: procurement exhaustion — dostawca przeciąga negocjacje, by wyczerpać kupującego. Postaw twarde zamknięcie: 'Nasze decyzje muszą zapaść do X. Jeśli nie osiągniemy porozumienia, przechodzimy do następnej alternatywy.'",
      en: "Detect: procurement exhaustion — supplier is deliberately prolonging negotiations to erode your resolve. Set a firm closing deadline: 'Our decision must be finalized by X. If we cannot reach agreement, we proceed to the next alternative.'",
    },
    priority: 75,
  },
  {
    id: "tac-011",
    tactic: "bundle_manipulation",
    description: "Supplier bundles high-margin items with essentials to obscure true pricing and prevent fair comparison.",
    detectionSignals: [
      "supplier insists on quoting only bundled packages",
      "pricing impossible to decompose to individual line items",
      "high-margin service added to essential product with no opt-out",
    ],
    counterMoves: [
      "demand unbundled pricing for every line item",
      "identify which bundle elements can be sourced separately",
      "run parallel RFQs on individual components",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: bundle manipulation — dostawca ukrywa cenę za bundlem. Żądaj rozbicia na pozycje. Który element jest drogi? Który możesz pozyskać oddzielnie? Unbundling ujawnia rzeczywisty koszt.",
      en: "Detect: bundle manipulation — supplier is obscuring pricing within a bundle. Demand line-item decomposition. Which element is overpriced? Which can you source separately? Unbundling reveals true cost.",
    },
    priority: 75,
  },
  {
    id: "tac-012",
    tactic: "price_storytelling",
    description: "Supplier constructs an elaborate narrative about cost pressures without providing verifiable data.",
    detectionSignals: [
      "long explanation of cost pressures without specific index data",
      "narrative focuses on suffering/difficulty rather than evidence",
      "emotional language about business challenges used to justify increase",
    ],
    counterMoves: [
      "acknowledge the narrative, then ask for data: 'What specific index shows this cost movement?'",
      "separate story from evidence: 'We understand the context — can we work from actual numbers?'",
      "present your own market data to reframe the conversation",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: price storytelling — dostawca buduje narrację o kosztach bez danych. Odpowiedź: 'Rozumiemy kontekst. Czy możemy przejść do konkretnych danych cost-driver?' Narracja nie zastępuje dowodów.",
      en: "Detect: price storytelling — supplier builds a cost narrative without data. Response: 'We understand the context. Can we move to specific cost-driver data?' A narrative does not substitute for evidence.",
    },
    priority: 80,
  },
  {
    id: "tac-013",
    tactic: "index_manipulation",
    description: "Supplier selectively applies commodity/market indices to justify increases while ignoring indices that would show stability or decrease.",
    detectionSignals: [
      "supplier cites one index without decomposing cost structure",
      "index applied to 100% of cost even though it only affects a portion",
      "indices that show decline for the same period ignored",
    ],
    counterMoves: [
      "decompose cost structure and apply indices only to relevant portions",
      "check multiple indices for the same period",
      "ask: 'What is the exact weight of this index in your total cost structure?'",
    ],
    systemPromptSnippet: {
      pl: "Rozpoznaj: index manipulation — dostawca stosuje indeks do całości kosztu, gdy dotyczy tylko jego części. Dekompozycja: surowce/energia/transport/overhead. Zastosuj właściwy indeks do właściwej wagi. To pokazuje realny uzasadniony wzrost.",
      en: "Detect: index manipulation — supplier applies an index to the entire cost when it affects only a portion. Decompose: raw materials/energy/transport/overhead. Apply the right index to the right weighting. This reveals the genuinely justified increase.",
    },
    priority: 90,
  },
];
