import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: { canonical: `${SITE_URL}/terms` },
    openGraph: {
      title: t("termsTitle"),
      description: t("termsDescription"),
      url: `${SITE_URL}/terms`,
      siteName: "Euro Remote Career",
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
    },
    twitter: { card: "summary", title: t("termsTitle") },
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");
  const tc = await getTranslations("Common");

  const sections = Array.from({ length: 9 }, (_, i) => {
    const n = i + 1;
    return { title: t(`s${n}Title`), text: t(`s${n}Text`) };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0E1A2B] sm:text-4xl dark:text-slate-100">
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("lastUpdated")}
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 dark:text-slate-300">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-[#0E1A2B] dark:text-slate-100">{s.title}</h2>
              <p className="mt-2 leading-relaxed">{s.text}</p>
            </section>
          ))}
          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B] dark:text-slate-100">{t("s10Title")}</h2>
            <p className="mt-2 leading-relaxed">
              {t("s10Text")}{" "}
              <a href="mailto:hello@euroremotecareer.com" className="text-navy-primary hover:text-navy-hover">
                hello@euroremotecareer.com
              </a>
              {" "}{t("s10Link")}{" "}
              <Link href="/contact" className="text-navy-primary hover:text-navy-hover">
                {t("contactPage")}
              </Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-700">
          <Link href="/" className="text-sm font-medium text-navy-primary hover:text-navy-hover">
            {tc("backToHome")}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
