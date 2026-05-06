import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PaymentsAdminView } from "./PaymentsAdminView";

export default async function AdminPaymentsPage() {
  const t = await getTranslations("AdminPayments");

  const [payments, subscriptions, extraPayments] = await Promise.all([
    prisma.payment.findMany({
      include: {
        plan: true,
        job: { select: { title: true, slug: true } },
        employer: { select: { companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findMany({
      include: {
        plan: true,
        employer: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: {
        status: "SUCCEEDED",
        plan: { slug: { in: ["short-listing", "extra-job"] } },
      },
      include: {
        plan: true,
        employer: { select: { id: true, companyName: true } },
        job: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const succeeded = payments.filter((p) => p.status === "SUCCEEDED");
  const totalRevenueCents = succeeded.reduce((sum, p) => sum + p.amountInCents, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRevenueCents = succeeded
    .filter((p) => p.paidAt && new Date(p.paidAt) >= startOfMonth)
    .reduce((sum, p) => sum + p.amountInCents, 0);

  // Group extras by employerId
  const extrasByEmployer: Record<string, typeof extraPayments> = {};
  for (const ep of extraPayments) {
    if (!extrasByEmployer[ep.employerId]) extrasByEmployer[ep.employerId] = [];
    extrasByEmployer[ep.employerId].push(ep);
  }

  // Build customer list: one row per subscription + merge their extras
  const customers = subscriptions.map((sub) => ({
    employerId: sub.employer.id,
    companyName: sub.employer.companyName,
    planName: sub.plan.name,
    planSlug: sub.plan.slug,
    status: sub.status,
    periodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    extras: extrasByEmployer[sub.employer.id] ?? [],
  }));

  // Employers with only extras (no subscription)
  const subscribedIds = new Set(subscriptions.map((s) => s.employer.id));
  const extraOnlyEmployers = Object.entries(extrasByEmployer)
    .filter(([id]) => !subscribedIds.has(id))
    .map(([id, extras]) => ({
      employerId: id,
      companyName: extras[0].employer.companyName,
      planName: null,
      planSlug: null,
      status: null,
      periodEnd: null,
      cancelAtPeriodEnd: false,
      extras,
    }));

  const allCustomers = [...customers, ...extraOnlyEmployers];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-slate-500 dark:text-foreground/60 mt-1">{t("subtitle")}</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border-card bg-white dark:bg-card-background p-5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-1">{t("totalRevenue")}</p>
          <p className="text-2xl font-bold text-foreground">€{(totalRevenueCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border-card bg-white dark:bg-card-background p-5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-1">{t("thisMonth")}</p>
          <p className="text-2xl font-bold text-foreground">€{(monthRevenueCents / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border-card bg-white dark:bg-card-background p-5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-1">{t("transactions")}</p>
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
        </div>
      </div>

      {/* Customers section */}
      {allCustomers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-3">{t("customers")} <span className="text-slate-400 font-normal text-sm">({allCustomers.length})</span></h2>
          <div className="rounded-[28px] border border-border-card bg-white dark:bg-card-background overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-card dark:border-slate-700/50">
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("employer")}</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("activePlan")}</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("extras")}</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("renewsEnds")}</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card dark:divide-slate-700/50">
                  {allCustomers.map((c) => {
                    const daysLeft = c.periodEnd
                      ? Math.ceil((new Date(c.periodEnd).getTime() - now.getTime()) / 86400000)
                      : null;

                    const statusStyle =
                      c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : c.status === "TRIALING" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : c.status === "PAST_DUE" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : c.status === "CANCELED" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-foreground/40";

                    return (
                      <tr key={c.employerId} className="hover:bg-slate-50 dark:hover:bg-card-active transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-foreground">{c.companyName}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-foreground/70">
                          {c.planName ?? <span className="text-slate-300 dark:text-foreground/20">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {c.extras.length === 0 ? (
                            <span className="text-slate-300 dark:text-foreground/20">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {c.extras.map((e) => (
                                <span key={e.id} className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-foreground/60">
                                  {e.plan.name}{e.job ? ` · ${e.job.title}` : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-foreground/60 whitespace-nowrap">
                          {daysLeft !== null ? (
                            <span className={daysLeft <= 7 ? "text-amber-500 font-medium" : ""}>
                              {c.cancelAtPeriodEnd ? "Ends in" : "Renews in"} {daysLeft}d
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {c.status ? (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyle}`}>
                              {c.cancelAtPeriodEnd ? "Canceling" : c.status}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-foreground/20 text-xs">extras only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <h2 className="text-base font-bold text-foreground mb-3">{t("transactionsTitle")}</h2>
      <PaymentsAdminView payments={JSON.parse(JSON.stringify(payments))} />
    </div>
  );
}
