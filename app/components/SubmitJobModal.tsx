"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { X, Layers, Clock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

type UsablePlan = {
  paymentId: string;
  name: string;
  slug: string;
  totalSlots: number;
  slotsUsed: number;
  availableSlots: number;
  daysLeft: number;
};

type PlanStatus = {
  usablePlans: UsablePlan[];
  quickListing: { id: string; name: string; priceInCents: number; durationDays: number } | null;
};

export function SubmitJobModal({
  jobId,
  isOpen,
  onClose,
  onSuccess,
  locale,
}: {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  locale: string;
}) {
  const t = useTranslations("SubmitJobModal");
  const router = useRouter();
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [fetching, setFetching] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<"slot" | "quick" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatus(null);
    setError(null);
    setSelectedPaymentId(null);
    setFetching(true);
    fetch("/api/employer/plan-status")
      .then((r) => r.json())
      .then((d: PlanStatus) => {
        setStatus(d);
        if (d.usablePlans.length === 1) setSelectedPaymentId(d.usablePlans[0].paymentId);
      })
      .catch(() => setError(t("errorGeneric")))
      .finally(() => setFetching(false));
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleUseSlot() {
    if (!jobId) return;
    setLoading("slot");
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/use-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: selectedPaymentId }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? t("errorGeneric"));
        return;
      }
      onClose();
      onSuccess?.();
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(null);
    }
  }

  async function handleQuickListing() {
    if (!status?.quickListing) return;
    setLoading("quick");
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, planId: status.quickListing.id, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? t("errorGeneric"));
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(null);
    }
  }

  function handleBuyPlan() {
    onClose();
    router.push(jobId ? `/checkout?jobId=${jobId}` : "/checkout");
  }

  const anyLoading = loading !== null;
  const hasPlans = status && status.usablePlans.length > 0;
  const multipleOptions = status && status.usablePlans.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-white dark:bg-card-background border border-border-card shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={anyLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-card-active transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base font-bold text-foreground mb-1">{t("title")}</h2>
        <p className="text-sm text-slate-500 dark:text-foreground/60 mb-5">{t("subtitle")}</p>

        {fetching ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-navy-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Plan slot options */}
            {hasPlans && (
              <div className="space-y-2">
                {status!.usablePlans.map((plan) => {
                  const selected = selectedPaymentId === plan.paymentId;
                  return (
                    <button
                      key={plan.paymentId}
                      onClick={() => setSelectedPaymentId(plan.paymentId)}
                      disabled={anyLoading}
                      className={`w-full flex items-center gap-4 rounded-[18px] border-2 p-4 text-left transition-all disabled:opacity-60 ${
                        selected
                          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                          : "border-border-card bg-white dark:bg-card-background hover:border-emerald-200 dark:hover:border-emerald-700/60"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${selected ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-card-active text-slate-400"}`}>
                        {selected ? <CheckCircle2 className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{plan.name}</p>
                        <p className="text-xs text-slate-500 dark:text-foreground/50 mt-0.5">
                          {t("slotsAvailable", { count: plan.availableSlots })} · {plan.daysLeft}d left
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{t("free")}</span>
                    </button>
                  );
                })}

                {/* Use slot action button (shown when a plan is selected) */}
                {selectedPaymentId && (
                  <button
                    onClick={handleUseSlot}
                    disabled={anyLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-3 transition-colors disabled:opacity-60"
                  >
                    {loading === "slot" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t("useSlot")}
                  </button>
                )}

                {/* Multi-plan hint */}
                {multipleOptions && !selectedPaymentId && (
                  <p className="text-xs text-slate-400 text-center">{t("selectPlanHint")}</p>
                )}
              </div>
            )}

            {/* Quick Listing */}
            {status?.quickListing && (
              <button
                onClick={handleQuickListing}
                disabled={anyLoading}
                className="w-full flex items-center gap-4 rounded-[18px] border-2 border-border-card bg-white dark:bg-card-background hover:border-navy-primary/40 p-4 text-left transition-all disabled:opacity-60"
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-card-active text-slate-500 dark:text-foreground/60 shrink-0">
                  {loading === "quick" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{t("quickListing")}</p>
                  <p className="text-xs text-slate-500 dark:text-foreground/50 mt-0.5">
                    {t("days", { count: status.quickListing.durationDays })}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">
                  €{(status.quickListing.priceInCents / 100).toFixed(0)}
                </span>
              </button>
            )}

            {/* Buy a plan */}
            <button
              onClick={handleBuyPlan}
              disabled={anyLoading}
              className="w-full flex items-center gap-4 rounded-[18px] border-2 border-border-card bg-white dark:bg-card-background hover:border-navy-primary/40 p-4 text-left transition-all disabled:opacity-60"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{t("buyPlan")}</p>
                <p className="text-xs text-slate-500 dark:text-foreground/50 mt-0.5">{t("buyPlanDesc")}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>

            {error && <p className="text-xs text-red-500 text-center pt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
