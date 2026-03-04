import { setRequestLocale } from "next-intl/server";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { SplitIntent } from "../components/SplitIntent";
import { CompanyLogos } from "../components/CompanyLogos";
import { HowItWorks } from "../components/HowItWorks";
import { Categories } from "../components/Categories";
import { FeaturedJobs } from "../components/FeaturedJobs";
import { EmployerTrustStrip } from "../components/EmployerTrustStrip";
import { Footer } from "../components/Footer";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-background">
      <Header />
      <main className="min-w-0">
        <Hero />
        <SplitIntent />
        <CompanyLogos />
        <HowItWorks />
        <Categories />
        <FeaturedJobs />
        <EmployerTrustStrip />
      </main>
      <Footer />
    </div>
  );
}
