import { getTranslations } from "next-intl/server";

export async function EmployerTrustStrip() {
  const t = await getTranslations("EmployerTrustStrip");

  return (
    <section className="bg-section-muted py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600 dark:text-slate-300">
          {t("text")}
        </p>
      </div>
    </section>
  );
}
