import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PaymentsAdminView } from "./PaymentsAdminView";

export default async function AdminPaymentsPage() {
  const t = await getTranslations("AdminPayments");

  const payments = await prisma.payment.findMany({
    include: {
      plan: true,
      job: { select: { title: true, slug: true } },
      employer: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const succeeded = payments.filter((p) => p.status === "SUCCEEDED");
  const totalRevenueCents = succeeded.reduce((sum, p) => sum + p.amountInCents, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRevenueCents = succeeded
    .filter((p) => p.paidAt && new Date(p.paidAt) >= startOfMonth)
    .reduce((sum, p) => sum + p.amountInCents, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-slate-500 dark:text-foreground/60 mt-1">{t("subtitle")}</p>
      </div>

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

      <PaymentsAdminView payments={JSON.parse(JSON.stringify(payments))} />
    </div>
  );
}
