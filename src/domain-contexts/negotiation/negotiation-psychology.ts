// ─────────────────────────────────────────────────────────
// Negotiation — Procurement Psychology Patterns
//
// Buyer-side psychology: what procurement teams feel under
// pressure, and how the advisor restores structured reasoning.
// Pattern → detected → systemPromptSnippet → advisory tone shifts.
// ─────────────────────────────────────────────────────────

import type { PsychologyEntry } from "../../context-layers/types";

export const NEGOTIATION_PSYCHOLOGY_PATTERNS: PsychologyEntry[] = [
  {
    id: "neg-psy-001",
    pattern: "confidence_collapse",
    underlyingNeed: "Buyer lacks benchmark data and starts believing the supplier's narrative is correct.",
    advisoryResponse: "Restore objective grounding. Provide benchmark reference. Make clear: without data, any supplier claim is just a position, not fact.",
    systemPromptSnippet: {
      pl: "Użytkownik traci pewność siebie — brak benchmarku sprawia, że narraacja dostawcy wydaje się prawdziwa. Przywróć obiektywny grunt: 'Bez danych porównawczych każda oferta to tylko pozycja negocjacyjna — nie fakt rynkowy.' Pomóż zidentyfikować dostępne źródła benchmarku.",
      en: "The user is losing confidence — lack of benchmark makes the supplier narrative feel true. Restore objective grounding: 'Without comparative data, any offer is a negotiation position — not a market fact.' Help identify available benchmark sources.",
    },
  },
  {
    id: "neg-psy-002",
    pattern: "visibility_anxiety",
    underlyingNeed: "Organization lacks reliable market data and feels exposed — don't know what is 'normal' pricing.",
    advisoryResponse: "Prioritize intelligence gathering over immediate negotiation. No negotiation should start without basic market visibility.",
    systemPromptSnippet: {
      pl: "Użytkownik ma anxiety wynikającą z braku danych rynkowych. Najpierw: zbuduj visibility zanim zaczniesz negocjować. Negotiation bez benchmarku to negotiation ślepa. Pomóż zidentyfikować dostępne źródła danych: Apollo, industry reports, alternatywni dostawcy.",
      en: "The user is experiencing visibility anxiety from lack of market data. First: build visibility before beginning negotiation. Negotiation without benchmark data is blind negotiation. Help identify available data sources.",
    },
  },
  {
    id: "neg-psy-003",
    pattern: "fear_driven_decisions",
    underlyingNeed: "Buyer accepts poor terms because they fear supply disruption more than they fear financial loss.",
    advisoryResponse: "Quantify both risks: cost of supply disruption vs. cost of accepting bad terms. Often the financial loss from acceptance exceeds disruption risk.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: decyzje z lęku — kupujący akceptuje złe warunki, bo boi się przerw w dostawach bardziej niż strat finansowych. Kwantyfikuj oba ryzyka: koszt akceptacji złych warunków vs. realne ryzyko disruption. Często to pierwsze jest wyższe.",
      en: "Detect: fear-driven decisions — buyer accepts poor terms because supply disruption fear dominates financial risk assessment. Quantify both risks: cost of accepting bad terms vs. realistic disruption risk. Often the financial loss from acceptance is higher.",
    },
  },
  {
    id: "neg-psy-004",
    pattern: "escalation_anxiety",
    underlyingNeed: "Procurement team fears that firm negotiation will damage the relationship or trigger supplier retaliation.",
    advisoryResponse: "Frame firm negotiation as professional expectation. Suppliers respect structured negotiation. Weak negotiation signals poor governance.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: escalation anxiety — obawa, że twarda negocjacja zniszczy relację. Koryguj: profesjonalni dostawcy oczekują ustrukturyzowanych negocjacji. Brak nacisku jest sygnałem słabej pozycji, nie dobrego partnerstwa.",
      en: "Detect: escalation anxiety — fear that firm negotiation will damage the relationship. Correct this: professional suppliers expect structured negotiation. Lack of pressure signals poor governance, not good partnership.",
    },
  },
  {
    id: "neg-psy-005",
    pattern: "supplier_intimidation",
    underlyingNeed: "Supplier uses aggressive communication, ultimatums or status dynamics to make buyer feel inferior.",
    advisoryResponse: "Name the intimidation pattern. Provide tactical framing that restores equilibrium. Executive presence guidance.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: supplier intimidation — dostawca stosuje agresywną komunikację lub ultimatum. Nazwij to: 'To taktyka negocjacyjna, nie ostateczna rzeczywistość.' Odpowiedź: spokój, dane, równoważna pozycja. Nie negocjuj ze strachu.",
      en: "Detect: supplier intimidation — supplier using aggressive communication or ultimatums. Name it: 'This is a negotiation tactic, not final reality.' Response: composure, data, equivalent standing. Do not negotiate from a position of fear.",
    },
  },
  {
    id: "neg-psy-006",
    pattern: "stakeholder_pressure",
    underlyingNeed: "Internal stakeholders (operations, manufacturing, sales) are pushing procurement to just 'close the deal' to avoid disruption.",
    advisoryResponse: "Align internal expectations on the cost of premature closure. Procurement must present financial quantification to internal pressure.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: presja wewnętrzna — operacje/sprzedaż naciskają, by 'po prostu zamknąć'. Pomóż skwantyfikować: ile kosztuje przyjęcie tych warunków na 3 lata? Procurement musi prezentować finansowy koszt presji wewnętrznej.",
      en: "Detect: internal stakeholder pressure — operations or sales pushing to 'just close.' Help quantify: what does accepting these terms cost over 3 years? Procurement must present the financial cost of internal pressure to decision-makers.",
    },
  },
  {
    id: "neg-psy-007",
    pattern: "negotiation_fatigue",
    underlyingNeed: "Long negotiation process has worn down the buyer's team, leading to concessions made to end the process rather than improve the outcome.",
    advisoryResponse: "Identify fatigue signals. Recommend: time-bound closure, escalation of authority, reduction of participants.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: zmęczenie negocjacyjne — concessions wynikające z wyczerpania, nie z logiki. Postaw twarde zamknięcie: termin decyzji, eskalacja decision authority, zmniejszenie liczby uczestników. Nie negocjuj w stanie zmęczenia.",
      en: "Detect: negotiation fatigue — concessions being made from exhaustion, not logic. Set a firm closing: decision deadline, escalate decision authority, reduce participant count. Do not negotiate in a fatigued state.",
    },
  },
  {
    id: "neg-psy-008",
    pattern: "transformation_resistance",
    underlyingNeed: "Organization knows it needs to change procurement approach but fears the complexity of transformation.",
    advisoryResponse: "Start with achievable wins. Quick wins create political capital. Education before transformation. Reduce perceived complexity.",
    systemPromptSnippet: {
      pl: "Rozpoznaj: opór przed transformacją — organizacja wie, że musi się zmienić, ale boi się złożoności. Proponuj: zacznij od jednego quick win. Polityczny kapitał z pierwszego sukcesu otwiera drzwi do większych zmian.",
      en: "Detect: transformation resistance — organization knows change is needed but fears complexity. Recommend: start with one achievable win. Political capital from the first success opens the door to larger changes.",
    },
  },
];
