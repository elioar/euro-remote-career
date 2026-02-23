import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

export const metadata: Metadata = {
  title: "Contact | Euro Remote Career",
  description:
    "Get in touch with Euro Remote Career. For employers, job submissions, or general enquiries. We reply within 1–2 business days.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact | Euro Remote Career",
    description:
      "Contact Euro Remote Career. Employers, job submissions, or general enquiries. We reply within 1–2 business days.",
    url: `${SITE_URL}/contact`,
    siteName: "Euro Remote Career",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Euro Remote Career",
    description: "Get in touch. Employers & job seekers. Reply within 1–2 business days.",
  },
  robots: { index: true, follow: true },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
