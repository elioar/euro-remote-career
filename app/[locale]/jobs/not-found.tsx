import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export default async function JobNotFound() {
  const t = await getTranslations("JobNotFound");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0E1A2B] sm:text-3xl dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          {t("description")}
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
        >
          {t("backToJobs")}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
