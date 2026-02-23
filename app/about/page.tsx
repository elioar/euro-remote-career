import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AboutContent } from "./AboutContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

export const metadata: Metadata = {
  title: "About | Euro Remote Career",
  description:
    "Euro Remote Career is a curated platform for high-quality remote and async-friendly jobs in Europe. Apply on the official company site. Quality over quantity.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About | Euro Remote Career",
    description:
      "Curated platform for remote and async-friendly jobs in Europe. Quality over quantity.",
    url: `${SITE_URL}/about`,
    siteName: "Euro Remote Career",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Euro Remote Career",
    description: "Curated remote & async jobs in Europe. Apply on company site.",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
