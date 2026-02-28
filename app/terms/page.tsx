import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

export const metadata: Metadata = {
  title: "Terms of Use | Euro Remote Career",
  description:
    "Terms of use for Euro Remote Career. Rules for using our job board and linking to employer sites.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Terms of Use | Euro Remote Career",
    description:
      "Terms of use for our job board. Rules for browsing listings and linking to employer sites.",
    url: `${SITE_URL}/terms`,
    siteName: "Euro Remote Career",
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary", title: "Terms of Use | Euro Remote Career" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0E1A2B] sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: February 2025
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">1. Acceptance</h2>
            <p className="mt-2 leading-relaxed">
              By using the Euro Remote Career website (&quot;the site&quot;), you agree to these terms. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">2. Use of the site</h2>
            <p className="mt-2 leading-relaxed">
              The site is a curated job board. You may browse listings, use search and filters, and follow links to apply on the official company or publisher site. You must not use the site for any unlawful purpose, or attempt to disrupt, hack, or overload it. We reserve the right to restrict or block access if we believe you have breached these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">3. Job listings and applications</h2>
            <p className="mt-2 leading-relaxed">
              Job listings are provided for information only. We do not guarantee the accuracy, completeness, or availability of any role. Applications are submitted on the employer&apos;s or third-party site, not on Euro Remote Career. We are not a party to any employment or application process and are not responsible for the conduct of employers or the outcome of your application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">4. No employment relationship</h2>
            <p className="mt-2 leading-relaxed">
              Use of the site does not create an employment, agency, or other contractual relationship between you and Euro Remote Career. Any contract is between you and the employer or publisher whose site you use to apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">5. Intellectual property</h2>
            <p className="mt-2 leading-relaxed">
              The site design, text, and other content (excluding job listing content provided by or on behalf of employers) are owned by Euro Remote Career or our licensors. You may not copy, scrape, or reuse them for commercial purposes without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">6. Links to third parties</h2>
            <p className="mt-2 leading-relaxed">
              The site links to external websites (e.g. employer career pages). We do not control those sites and are not responsible for their content, privacy practices, or terms. Your use of third-party sites is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">7. Limitation of liability</h2>
            <p className="mt-2 leading-relaxed">
              The site is provided &quot;as is&quot;. To the fullest extent permitted by law, Euro Remote Career shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or reliance on any listing or third-party link. Our total liability shall not exceed the amount you have paid to us in the twelve months preceding the claim (if any).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">8. Changes</h2>
            <p className="mt-2 leading-relaxed">
              We may update these terms at any time. The &quot;Last updated&quot; date at the top will change when we do. Continued use of the site after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">9. Governing law</h2>
            <p className="mt-2 leading-relaxed">
              These terms are governed by the laws of Greece. Any dispute shall be subject to the exclusive jurisdiction of the courts of Greece, unless otherwise required by mandatory law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">10. Contact</h2>
            <p className="mt-2 leading-relaxed">
              For questions about these terms, email{" "}
              <a href="mailto:hello@euroremotecareer.com" className="text-navy-primary hover:text-navy-hover">
                hello@euroremotecareer.com
              </a>
              {" "}or see our{" "}
              <Link href="/contact" className="text-navy-primary hover:text-navy-hover">
                Contact page
              </Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <Link
            href="/"
            className="text-sm font-medium text-navy-primary hover:text-navy-hover"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
