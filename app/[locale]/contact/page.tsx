import { setRequestLocale } from "next-intl/server";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { ContactContent } from "./ContactContent";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <ContactContent />
      </main>
      <Footer />
    </div>
  );
}
