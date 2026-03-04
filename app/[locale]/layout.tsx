import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const title = t("homeTitle");
  const description = t("homeDescription");

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      "remote jobs",
      "async jobs",
      "remote work",
      "Europe remote jobs",
      "Euro Remote Career",
    ],
    authors: [{ name: "Euro Remote Career", url: SITE_URL }],
    creator: "Euro Remote Career",
    publisher: "Euro Remote Career",
    alternates: {
      canonical: SITE_URL,
      languages: { el: SITE_URL, en: `${SITE_URL}/en` },
    },
    openGraph: {
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
      url: SITE_URL,
      siteName: "Euro Remote Career",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    category: "jobs",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const description = t("homeDescription");

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Euro Remote Career",
      url: SITE_URL,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Euro Remote Career",
      url: SITE_URL,
      description,
      publisher: { "@type": "Organization", name: "Euro Remote Career" },
    },
  ];

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
