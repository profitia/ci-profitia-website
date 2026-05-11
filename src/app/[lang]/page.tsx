import { isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { AdaptivePage } from "@/components/adaptive/AdaptivePage";

export default async function LangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";

  const hero = {
    pl: {
      tag: "Doradztwo Zakupowe",
      headline: "Zakupy, które aktywnie budują marżę.",
      sub: "Profitia wspiera organizacje w negocjacjach, analizie kosztów i strategii zakupowej — od diagnozy do wyników.",
      cta: "Porozmawiajmy",
    },
    en: {
      tag: "Procurement Advisory",
      headline: "Procurement that actively drives margin.",
      sub: "Profitia supports organisations in negotiations, cost analysis and procurement strategy — from diagnosis to results.",
      cta: "Let's talk",
    },
  }[locale];

  const services = {
    pl: [
      { slug: "/services/analiza-spot", label: "Analiza SPOT", desc: "Diagnoza struktury zakupów i identyfikacja potencjału oszczędności." },
      { slug: "/services/negotiation-preparation", label: "Przygotowanie do negocjacji", desc: "Fact-based negotiation prep: should-cost, benchmarki, BATNA." },
      { slug: "/services/supplier-benchmarking", label: "Benchmarking dostawców", desc: "Zewnętrzny punkt odniesienia dla oceny warunków handlowych." },
      { slug: "/services/procurement-transformation", label: "Transformacja zakupów", desc: "Budowa kompetencji, struktury i procesów zakupowych od podstaw." },
      { slug: "/services/spend-cube", label: "Spend Cube", desc: "Widoczność 100% wydatków w jednym miejscu. Decyzje oparte na danych." },
      { slug: "/services/should-cost-analysis", label: "Should-Cost Analysis", desc: "Niezależna kalkulacja uzasadnionego kosztu produktu lub usługi." },
    ],
    en: [
      { slug: "/services/analiza-spot", label: "SPOT Analysis", desc: "Procurement structure diagnosis and savings potential identification." },
      { slug: "/services/negotiation-preparation", label: "Negotiation Preparation", desc: "Fact-based negotiation prep: should-cost, benchmarks, BATNA." },
      { slug: "/services/supplier-benchmarking", label: "Supplier Benchmarking", desc: "External reference point for assessing commercial terms." },
      { slug: "/services/procurement-transformation", label: "Procurement Transformation", desc: "Building procurement capabilities, structure and processes from scratch." },
      { slug: "/services/spend-cube", label: "Spend Cube", desc: "100% spend visibility in one place. Data-driven decisions." },
      { slug: "/services/should-cost-analysis", label: "Should-Cost Analysis", desc: "Independent calculation of the justified cost of a product or service." },
    ],
  }[locale];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 max-w-5xl mx-auto">
        <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-advisory-600 dark:text-advisory-500 mb-4">
          {hero.tag}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight leading-tight max-w-3xl">
          {hero.headline}
        </h1>
        <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          {hero.sub}
        </p>
        <div className="mt-8 flex items-center gap-4">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-advisory-700 px-6 py-3 text-sm font-semibold text-white hover:bg-advisory-800 transition-colors"
          >
            {hero.cta}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ── ETAP 3 Adaptive Advisory Layer ───────────────── */}
      <section className="px-6 pb-8 max-w-5xl mx-auto">
        <AdaptivePage locale={locale} />
      </section>

      {/* ── Static services grid ─────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-8">
          {locale === "pl" ? "Nasze obszary" : "Our areas"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <a
              key={s.slug}
              href={s.slug}
              className="group block rounded-xl border border-gray-200 dark:border-gray-800 hover:border-advisory-300 dark:hover:border-advisory-700 bg-white dark:bg-gray-950 p-5 transition-all hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-advisory-800 dark:group-hover:text-advisory-300 transition-colors">
                {s.label}
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                {s.desc}
              </p>
              <span className="mt-3 inline-block text-xs font-semibold text-advisory-700 dark:text-advisory-400">
                {locale === "pl" ? "Więcej" : "Learn more"} →
              </span>
            </a>
          ))}
        </div>
      </section>

    </main>
  );
}
