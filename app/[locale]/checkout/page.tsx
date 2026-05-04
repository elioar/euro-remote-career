import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Tag } from "lucide-react";
import { Header } from "@/app/components/Header";
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
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header />
    <div className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Launch offer banner */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider px-4 py-2">
            <Tag className="h-3.5 w-3.5" />
            {t("launchOffer")}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-foreground mb-3">{t("pricingTitle")}</h1>
          <p className="text-slate-500 dark:text-foreground/60">{t("pricingSubtitle")}</p>
        </div>

        <CheckoutPlanSelector plans={plans} jobId={jobId ?? null} />

        <p className="text-center text-xs text-slate-400 dark:text-foreground/30 mt-6">{t("securePayment")}</p>
      </div>
    </div>
    </div>
  );
}
