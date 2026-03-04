import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: { canonical: `${SITE_URL}/contact` },
    openGraph: {
      title: t("contactTitle"),
      description: t("contactDescription"),
      url: `${SITE_URL}/contact`,
      siteName: "Euro Remote Career",
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
    },
    twitter: { card: "summary_large_image", title: t("contactTitle"), description: t("contactDescription") },
    robots: { index: true, follow: true },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
