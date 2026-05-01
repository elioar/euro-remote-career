import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CheckoutPlanSelector } from "./CheckoutPlanSelector";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { locale } = await params;
  const { jobId } = await searchParams;
  const t = await getTranslations("Checkout");

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("title")}</h1>
          <p className="text-slate-500 dark:text-foreground/60">{t("subtitle")}</p>
        </div>
        <CheckoutPlanSelector plans={plans} jobId={jobId ?? null} locale={locale} />
      </div>
    </div>
  );
}
