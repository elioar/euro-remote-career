import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";
import { syncCheckoutSession } from "@/lib/payments/sync";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const t = await getTranslations("Checkout");

  // Fallback sync: ensures subscription/payment is saved even if webhook hasn't fired yet
  if (session_id) {
    try {
      await syncCheckoutSession(session_id);
    } catch (err) {
      console.error("Session sync failed:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{t("successTitle")}</h1>
        <p className="text-slate-500 dark:text-foreground/60 mb-8">{t("successDesc")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-navy-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-hover"
        >
          {t("goToDashboard")}
        </Link>
      </div>
    </div>
  );
}
