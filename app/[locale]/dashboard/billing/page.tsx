import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Header } from "@/app/components/Header";
import { BillingHistory } from "./BillingHistory";
import { BillingPortalButton } from "./BillingPortalButton";
import { getEmployerPayments, getActivePlanForEmployer } from "@/lib/payments/queries";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Billing");
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { employerProfile: true },
  });
  if (!user || user.role !== "EMPLOYER") redirect("/dashboard");
  if (!user.employerProfile) redirect("/dashboard");

  const [payments, activePlan] = await Promise.all([
    getEmployerPayments(user.employerProfile.id),
    getActivePlanForEmployer(user.employerProfile.id),
  ]);

  const periodEndStr = activePlan?.periodEnd
    ? new Date(activePlan.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-slate-500 dark:text-foreground/60 mt-1">{t("subtitle")}</p>
        </div>

        {/* Active subscription card */}
        <div className="mb-8 rounded-[28px] border border-border-card bg-white dark:bg-card-background p-6">
          <p className="text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-3">
            {t("activeSubscription")}
          </p>
          {activePlan ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-foreground">{activePlan.name}</span>
                  {activePlan.cancelAtPeriodEnd ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-0.5 text-[11px] font-bold">
                      {t("cancelingBadge")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
                      {activePlan.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-foreground/50">
                  {activePlan.slotsUsed}/{activePlan.totalSlots} slots used &middot;{" "}
                  {activePlan.cancelAtPeriodEnd ? t("endsOn") : t("renewsOn")} {periodEndStr}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">{activePlan.daysLeft}d</span>
                  <p className="text-xs text-slate-400 dark:text-foreground/40">left</p>
                </div>
                <BillingPortalButton locale={locale} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-500 dark:text-foreground/50 font-medium">{t("noSubscription")}</p>
              <p className="text-sm text-slate-400 dark:text-foreground/30 mt-0.5">{t("noSubscriptionHint")}</p>
            </div>
          )}
        </div>

        {/* Payment history */}
        <h2 className="text-base font-bold text-foreground mb-3">{t("paymentHistory")}</h2>
        <BillingHistory payments={JSON.parse(JSON.stringify(payments))} />
      </div>
    </main>
  );
}
