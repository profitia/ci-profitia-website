// ─────────────────────────────────────────────────────────
// CI-Profitia — i18n Configuration
// ─────────────────────────────────────────────────────────

export const LOCALES = ["pl", "en"] as const;
export const DEFAULT_LOCALE = "en" as const;

export type Locale = (typeof LOCALES)[number];

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

// Assistant UI strings per locale
export const ASSISTANT_STRINGS = {
  pl: {
    triggerLabel: "Doradca",
    triggerAriaLabel: "Otwórz doradcę zakupowego",
    closeAriaLabel: "Zamknij asystenta",
    placeholder: "Napisz o swojej sytuacji zakupowej...",
    thinking: "Analizuję...",
    openingGreeting: "Czym mogę pomóc?",
    ctaSuffix: "→",
    errorMessage: "Wystąpił błąd. Spróbuj ponownie.",
    poweredBy: "Powered by Profitia Advisory Intelligence",
  },
  en: {
    triggerLabel: "Advisor",
    triggerAriaLabel: "Open procurement advisor",
    closeAriaLabel: "Close advisor",
    placeholder: "Describe your procurement situation...",
    thinking: "Analysing...",
    openingGreeting: "How can I help?",
    ctaSuffix: "→",
    errorMessage: "Something went wrong. Please try again.",
    poweredBy: "Powered by Profitia Advisory Intelligence",
  },
} as const;

export type AssistantStrings = typeof ASSISTANT_STRINGS[Locale];
