"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, Zap, Briefcase, Clock, Plus } from "lucide-react";
import type { Plan } from "@/lib/generated/prisma";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  basic: <Briefcase className="h-5 w-5" />,
  pro: <Zap className="h-5 w-5" />,
  "short-listing": <Clock className="h-5 w-5" />,
  "extra-job": <Plus className="h-5 w-5" />,
};

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(0)}`;
}

export function CheckoutPlanSelector({
  plans,
  jobId,
  locale,
}: {
  plans: Plan[];
  jobId: string | null;
  locale: string;
}) {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainPlans = plans.filter((p) => !p.isAddon);
  const addonPlans = plans.filter((p) => p.isAddon);

  async function handleProceed() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, planId: selectedId, locale }),
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
      setLoading(false);
    }
  }

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedId === plan.id;
    const hasPromo = !!plan.originalPriceInCents;
    return (
      <motion.button
        key={plan.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedId(plan.id)}
        className={`relative w-full text-left rounded-[28px] border-2 p-6 transition-all cursor-pointer ${
          isSelected
            ? "border-navy-primary bg-navy-primary/5 dark:bg-navy-primary/10"
            : "border-border-card bg-white dark:bg-card-background hover:border-navy-primary/40"
        }`}
      >
        {plan.slug === "pro" && (
          <span className="absolute -top-3 left-6 bg-navy-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {t("popular")}
          </span>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSelected ? "bg-navy-primary text-white" : "bg-slate-100 dark:bg-card-active text-slate-500 dark:text-foreground/60"}`}>
              {PLAN_ICONS[plan.slug] ?? <Briefcase className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold text-foreground">{plan.name}</p>
              <p className="text-sm text-slate-500 dark:text-foreground/60 mt-0.5">{plan.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {hasPromo && (
              <p className="text-xs text-slate-400 line-through">{formatPrice(plan.originalPriceInCents!)}</p>
            )}
            <p className={`text-2xl font-bold ${hasPromo ? "text-navy-primary" : "text-foreground"}`}>
              {formatPrice(plan.priceInCents)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-card-active px-3 py-1 text-xs font-medium text-slate-600 dark:text-foreground/70">
            <Check className="h-3 w-3" />
            {plan.jobSlots === 1 ? t("oneJobSlot") : t("jobSlots", { count: plan.jobSlots })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-card-active px-3 py-1 text-xs font-medium text-slate-600 dark:text-foreground/70">
            <Clock className="h-3 w-3" />
            {t("days", { count: plan.durationDays })}
          </span>
        </div>
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="h-5 w-5 rounded-full bg-navy-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainPlans.map(renderPlanCard)}
      </div>

      {addonPlans.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-3">{t("addons")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addonPlans.map(renderPlanCard)}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleProceed}
          disabled={!selectedId || loading}
          className="px-10 py-4 rounded-full bg-navy-primary text-white font-semibold text-sm transition-all hover:bg-navy-hover disabled:opacity-40 disabled:cursor-not-allowed min-w-[200px]"
        >
          {loading ? t("processing") : t("proceedToPayment")}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-foreground/30">{t("securePayment")}</p>
    </div>
  );
}
