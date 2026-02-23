import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

export const metadata: Metadata = {
  title: "Privacy Policy | Euro Remote Career",
  description:
    "Privacy policy for Euro Remote Career. How we collect, use, and protect your information when you use our job board.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy | Euro Remote Career",
    description:
      "How Euro Remote Career collects, uses, and protects your information. Privacy policy for our job board.",
    url: `${SITE_URL}/privacy`,
    siteName: "Euro Remote Career",
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary", title: "Privacy Policy | Euro Remote Career" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0E1A2B] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: February 2025
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">1. Who we are</h2>
            <p className="mt-2 leading-relaxed">
              Euro Remote Career (&quot;we&quot;, &quot;us&quot;) operates this website as a curated job board for remote and async-friendly roles. We do not collect CVs or host job applications on this site; you apply on the official company or publisher site linked from each listing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">2. Information we collect</h2>
            <p className="mt-2 leading-relaxed">
              We collect minimal information necessary to run the site:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><strong>Usage data:</strong> When you visit, we may log basic technical data (e.g. IP address, browser type, pages viewed) for security and analytics.</li>
              <li><strong>Contact data:</strong> If you email us (e.g. via the contact addresses on our Contact page), we process your message and contact details only to respond.</li>
              <li><strong>No application data:</strong> We do not collect or store your CV, cover letter, or any data you submit when applying on a company&apos;s site. Those submissions are governed by that company&apos;s privacy policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">3. How we use your information</h2>
            <p className="mt-2 leading-relaxed">
              We use the information above to operate and improve the site, respond to enquiries, and ensure security. We do not sell your personal data. We may use anonymised or aggregated data for analytics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">4. Cookies</h2>
            <p className="mt-2 leading-relaxed">
              We may use essential cookies to make the site function (e.g. session or preference cookies). We aim to keep non-essential and third-party tracking to a minimum. You can control cookies via your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">5. Third parties</h2>
            <p className="mt-2 leading-relaxed">
              Job listings link to external company sites. When you click &quot;Apply&quot; or follow a link, you leave our site and are subject to that third party&apos;s privacy policy. We are not responsible for their practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">6. Your rights</h2>
            <p className="mt-2 leading-relaxed">
              If you are in the European Economic Area or the UK, you have rights regarding your personal data, including access, correction, deletion, and objection. To exercise these or ask questions about our use of your data, contact us at{" "}
              <a href="mailto:hello@euroremotecareer.com" className="text-navy-primary hover:text-navy-hover">
                hello@euroremotecareer.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">7. Changes</h2>
            <p className="mt-2 leading-relaxed">
              We may update this policy from time to time. The &quot;Last updated&quot; date at the top will change when we do. Continued use of the site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0E1A2B]">8. Contact</h2>
            <p className="mt-2 leading-relaxed">
              For privacy-related questions or requests, email{" "}
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
