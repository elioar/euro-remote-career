"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type PaymentRow = {
  id: string;
  status: string;
  amountInCents: number;
  createdAt: string;
  paidAt: string | null;
  employer: { companyName: string };
  plan: { name: string };
  job: { title: string; slug: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  REFUNDED: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-foreground/50",
};

const ALL_STATUSES = ["ALL", "SUCCEEDED", "PENDING", "FAILED", "REFUNDED"];

export function PaymentsAdminView({ payments }: { payments: PaymentRow[] }) {
  const t = useTranslations("AdminPayments");
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [overriding, setOverriding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  async function handleOverride(id: string) {
    setOverriding(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${id}/override`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setOverriding(null);
    }
  }

  return (
    <div>
      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border ${
              filter === s
                ? "bg-navy-primary text-white border-navy-primary"
                : "border-border-card text-slate-600 dark:text-foreground/70 hover:border-navy-primary/40"
            }`}
          >
            {s === "ALL" ? t("filterAll") : t(`statusLabels.${s.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="rounded-[28px] border border-border-card bg-white dark:bg-card-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-card dark:border-slate-700/50">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("employer")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("plan")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("job")}</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("amount")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("date")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("status")}</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card dark:divide-slate-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 dark:text-foreground/30">
                    {t("noPayments")}
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-card-active transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{p.employer.companyName}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-foreground/60">{p.plan.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-foreground/60">
                    {p.job?.title ?? <span className="text-slate-300 dark:text-foreground/20">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                    €{(p.amountInCents / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-foreground/60 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING}`}>
                      {t(`statusLabels.${p.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.status === "PENDING" && (
                      <button
                        onClick={() => handleOverride(p.id)}
                        disabled={overriding === p.id}
                        className="text-xs font-semibold text-navy-primary hover:underline disabled:opacity-50"
                      >
                        {overriding === p.id ? "..." : t("markAsPaid")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
