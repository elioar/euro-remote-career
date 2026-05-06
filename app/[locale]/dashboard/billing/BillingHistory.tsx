"use client";

import { useLocale, useTranslations } from "next-intl";
import type { PaymentWithDetails } from "@/lib/payments/queries";

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  REFUNDED: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-foreground/50",
};

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function BillingHistory({ payments }: { payments: PaymentWithDetails[] }) {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const dateLocale = locale === "el" ? "el-GR" : "en-GB";

  if (payments.length === 0) {
    return (
      <div className="rounded-[28px] border border-border-card bg-white dark:bg-card-background p-12 text-center">
        <p className="text-slate-400 dark:text-foreground/40">{t("noPayments")}</p>
        <p className="text-sm text-slate-400 dark:text-foreground/30 mt-1">{t("noPaymentsHint")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-border-card bg-white dark:bg-card-background overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-card dark:border-slate-700/50">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("date")}</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("plan")}</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("job")}</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("amount")}</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card dark:divide-slate-700/50">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-card-active transition-colors">
                <td className="px-6 py-4 text-slate-600 dark:text-foreground/70 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-6 py-4 font-medium text-foreground">{p.plan.name}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-foreground/50">
                  {p.job?.title ?? <span className="text-slate-300 dark:text-foreground/20">—</span>}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-foreground">{formatPrice(p.amountInCents)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING}`}>
                    {t(`statusLabels.${p.status.toLowerCase()}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
