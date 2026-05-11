// ─────────────────────────────────────────────────────────
// CIC Runtime — Multilingual Engine
// Locale-aware output management and adaptation
// ─────────────────────────────────────────────────────────

import type { DeploymentConfig } from "../schemas/deployment.schema";

export type SupportedLocale = "pl" | "en";

// ── Locale resolution ─────────────────────────────────────
export function resolveLocale(
  requested: string,
  deployment: DeploymentConfig
): SupportedLocale {
  const supported = deployment.locales as string[];
  if (supported.includes(requested)) return requested as SupportedLocale;
  return (deployment.defaultLocale as SupportedLocale) ?? "en";
}

// ── Locale variants ───────────────────────────────────────
export type LocaleVariant =
  | "pl-standard"
  | "pl-formal"
  | "pl-executive"
  | "en-standard"
  | "en-executive"
  | "en-concise";

export function getLocaleVariant(
  locale: SupportedLocale,
  tone: string,
  executiveMode: boolean
): LocaleVariant {
  if (locale === "pl") {
    if (executiveMode || tone === "executive") return "pl-executive";
    if (tone === "strategic" || tone === "peer") return "pl-formal";
    return "pl-standard";
  }
  if (executiveMode || tone === "executive") return "en-executive";
  if (tone === "analytical") return "en-concise";
  return "en-standard";
}

// ── Advisory tone strings ─────────────────────────────────
export const TONE_SYSTEM_HINTS: Record<string, Record<SupportedLocale, string>> = {
  diagnostic: {
    pl: "Mów językiem diagnozy: wyjaśniaj konsekwencje, zadawaj precyzyjne pytania, pomagaj zrozumieć sytuację.",
    en: "Use diagnostic language: explain consequences, ask precise questions, help the user understand their situation.",
  },
  analytical: {
    pl: "Mów językiem danych: benchmarki, liczby, fakty. Bądź precyzyjny i konkretny.",
    en: "Use data language: benchmarks, numbers, facts. Be precise and specific.",
  },
  strategic: {
    pl: "Mów językiem strategii: frameworki, category thinking, najlepsze praktyki. Peer-to-peer.",
    en: "Use strategic language: frameworks, category thinking, best practices. Peer-to-peer level.",
  },
  executive: {
    pl: "Mów językiem zarządu: wpływ na marżę, EBIT, ryzyko, cash flow, przewidywalność. Bez zbędnych szczegółów operacyjnych.",
    en: "Use executive language: EBIT impact, margin, risk, cash flow, predictability. Skip operational details.",
  },
  peer: {
    pl: "Mów jak partner transformacji: systemowe myślenie, zmiana organizacyjna, budowanie kompetencji.",
    en: "Speak as a transformation partner: systemic thinking, organizational change, capability building.",
  },
};

// ── CTA labels ────────────────────────────────────────────
export const CTA_LABELS: Record<string, Record<SupportedLocale, string>> = {
  contact_form: { pl: "Porozmawiajmy", en: "Let's talk" },
  spot_analysis: { pl: "Zamów Analizę SPOT", en: "Request SPOT Analysis" },
  workshop: { pl: "Dowiedz się o warsztatach", en: "Learn about workshops" },
  phone: { pl: "Zadzwoń do nas", en: "Call us" },
  email: { pl: "Napisz do nas", en: "Email us" },
  service_order: { pl: "Sprawdź szczegóły", en: "See details" },
  coaching: { pl: "Dowiedz się o mentoringu", en: "Learn about mentoring" },
  content: { pl: "Czytaj więcej", en: "Read more" },
};

export function getCTALabel(ctaType: string, locale: SupportedLocale): string {
  return CTA_LABELS[ctaType]?.[locale] ?? (locale === "pl" ? "Dowiedz się więcej" : "Learn more");
}

// ── Multilingual system prompt instructions ───────────────
export function getMultilingualInstruction(locale: SupportedLocale): string {
  return locale === "pl"
    ? "Odpowiadaj wyłącznie po polsku, dostosuj styl do rozmówcy, używaj formalnego 'Pan/Pani' chyba że kontekst wskazuje inaczej."
    : "Respond in English only. Use professional but human tone. Avoid overly formal language.";
}

// ── Locale-aware urgency messaging ────────────────────────
export const URGENCY_MESSAGES: Record<string, Record<SupportedLocale, string>> = {
  U1: {
    pl: "Sytuacja wymaga działania — zaproponuj rozmowę w tym tygodniu.",
    en: "The situation requires action — suggest a conversation this week.",
  },
  U2: {
    pl: "Temat jest aktywny — zaproponuj konkretny następny krok.",
    en: "The topic is active — propose a concrete next step.",
  },
  U3: {
    pl: "Faza eksploracji — edukuj, nie sprzedawaj.",
    en: "Exploration phase — educate, don't sell.",
  },
};

export function getUrgencyInstruction(urgency: string, locale: SupportedLocale): string {
  return URGENCY_MESSAGES[urgency]?.[locale] ?? "";
}

// ── Localized phase labels ────────────────────────────────
export const PHASE_LABELS: Record<string, Record<SupportedLocale, string>> = {
  idle: { pl: "Oczekiwanie", en: "Idle" },
  opening: { pl: "Wstęp", en: "Opening" },
  diagnostic: { pl: "Diagnoza", en: "Diagnostic" },
  capability_recommendation: { pl: "Rekomendacja", en: "Recommendation" },
  escalation: { pl: "Eskalacja", en: "Escalation" },
  closing: { pl: "Zamknięcie", en: "Closing" },
};

export function getPhaseLabel(phase: string, locale: SupportedLocale): string {
  return PHASE_LABELS[phase]?.[locale] ?? phase;
}
