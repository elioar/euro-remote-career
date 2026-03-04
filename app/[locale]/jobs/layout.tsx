import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("jobsTitle"),
    description: t("jobsDescription"),
    alternates: { canonical: `${SITE_URL}/jobs` },
    openGraph: {
      title: t("jobsTitle"),
      description: t("jobsDescription"),
      url: `${SITE_URL}/jobs`,
      siteName: "Euro Remote Career",
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: t("jobsTitle"),
      description: t("jobsDescription"),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
