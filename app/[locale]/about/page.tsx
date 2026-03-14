import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { AboutContent } from "./AboutContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      title: t("aboutTitle"),
      description: t("aboutDescription"),
      url: `${SITE_URL}/about`,
      siteName: "Euro Remote Career",
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
    },
    twitter: { card: "summary_large_image", title: t("aboutTitle"), description: t("aboutDescription") },
    robots: { index: true, follow: true },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
