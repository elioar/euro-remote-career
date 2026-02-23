import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SplitIntent } from "./components/SplitIntent";
import { CompanyLogos } from "./components/CompanyLogos";
import { HowItWorks } from "./components/HowItWorks";
import { Categories } from "./components/Categories";
import { FeaturedJobs } from "./components/FeaturedJobs";
import { EmployerTrustStrip } from "./components/EmployerTrustStrip";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-white">
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
