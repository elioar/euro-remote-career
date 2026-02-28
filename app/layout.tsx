import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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

const defaultTitle = "Euro Remote Career | Curated Remote & Async Jobs";
const defaultDescription =
  "Find high-quality remote and async jobs in Tech, Design, Marketing & Product. Curated opportunities across Europe. Apply on the company site.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: defaultTitle,
  description: defaultDescription,
  keywords: [
    "remote jobs",
    "async jobs",
    "remote work",
    "Europe remote jobs",
    "tech jobs",
    "design jobs",
    "marketing jobs",
    "product jobs",
    "curated job board",
    "Euro Remote Career",
  ],
  authors: [{ name: "Euro Remote Career", url: SITE_URL }],
  creator: "Euro Remote Career",
  publisher: "Euro Remote Career",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "Euro Remote Career",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: "jobs",
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Euro Remote Career",
    url: SITE_URL,
    description: defaultDescription,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Euro Remote Career",
    url: SITE_URL,
    description: defaultDescription,
    publisher: { "@type": "Organization", name: "Euro Remote Career" },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
        {children}
      </body>
    </html>
  );
}
