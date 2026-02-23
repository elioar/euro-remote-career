import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About | Euro Remote Career",
  description:
    "Euro Remote Career is a curated platform for high-quality remote and async-friendly jobs in Europe. Apply on the official company site. Quality over quantity.",
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
