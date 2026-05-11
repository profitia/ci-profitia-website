import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { AdvisoryAssistant } from "@/features/advisory-assistant/AdvisoryAssistant";
import { isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "pl" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : "en";
  return {
    title:
      locale === "pl"
        ? "Profitia — Doradztwo Zakupowe"
        : "Profitia — Procurement Advisory",
    description:
      locale === "pl"
        ? "Inteligencja zakupowa, negocjacje i doradztwo dla organizacji, które chcą żeby zakupy aktywnie budowały marżę."
        : "Procurement intelligence, negotiations and advisory for organisations that want procurement to actively drive margin.",
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";

  return (
    <Providers locale={locale}>
      {children}
      {/* Advisory Assistant — always present, floats over page */}
      <AdvisoryAssistant locale={locale} />
    </Providers>
  );
}
