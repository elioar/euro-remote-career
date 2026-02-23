import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

export const metadata: Metadata = {
  title: "Browse Jobs | Euro Remote Career",
  description:
    "Browse curated remote and async-friendly jobs in Tech, Design, Marketing & Product. Apply on the company site. EU-focused, quality over quantity.",
  keywords: [
    "remote jobs",
    "async jobs",
    "remote work Europe",
    "tech jobs remote",
    "design jobs remote",
    "marketing jobs remote",
    "product jobs remote",
    "Euro Remote Career",
  ],
  alternates: {
    canonical: `${SITE_URL}/jobs`,
  },
  openGraph: {
    title: "Browse Jobs | Euro Remote Career",
    description:
      "Browse curated remote and async-friendly jobs in Tech, Design, Marketing & Product. Apply on the company site.",
    url: `${SITE_URL}/jobs`,
    siteName: "Euro Remote Career",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Jobs | Euro Remote Career",
    description:
      "Curated remote & async jobs in Tech, Design, Marketing & Product. Apply on company site.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
