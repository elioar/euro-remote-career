"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Star, Clock, Check, ShieldCheck, BarChart3, Settings, HeadphonesIcon, Info, Plus, ArrowRight, Loader2 } from "lucide-react";
import type { Plan } from "@/lib/generated/prisma";

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-bold px-2 py-0.5">
      -{pct}%
    </span>
  );
}

export function CheckoutPlanSelector({
  plans,
  jobId,
}: {
  plans: Plan[];
  jobId: string | null;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [addShortListing, setAddShortListing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basic = plans.find((p) => p.slug === "basic");
  const pro = plans.find((p) => p.slug === "pro");
  const shortListing = plans.find((p) => p.slug === "short-listing");

  async function handlePay() {
    if (!selectedPlan) return;
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { jobId, planId: selectedPlan.id, locale };
      if (addShortListing && shortListing) body.addShortListingId = shortListing.id;
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) { setError(data.error ?? t("errorGeneric")); return; }
      window.location.href = data.url;
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickOnly() {
    if (!shortListing) return;
    setLoadingQuick(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, planId: shortListing.id, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) { setError(data.error ?? t("errorGeneric")); return; }
      window.location.href = data.url;
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoadingQuick(false);
    }
  }

  const total = selectedPlan
    ? selectedPlan.priceInCents + (addShortListing && shortListing ? shortListing.priceInCents : 0)
    : 0;

  const anyLoading = loading || loadingQuick;

  function PlanCard({ plan, accent }: { plan: Plan; accent: "blue" | "emerald" }) {
    const isSelected = selectedPlan?.id === plan.id;
    const isShort = plan.slug === "short-listing";
    const borderClass = isSelected
      ? accent === "blue"
        ? "border-blue-500 ring-2 ring-blue-500/30"
        : "border-emerald-500 ring-2 ring-emerald-500/30"
      : "border-slate-200 dark:border-slate-700/60";
    const iconBg = accent === "blue" ? "bg-blue-100 dark:bg-blue-500/20" : "bg-emerald-50 dark:bg-emerald-500/10";
    const iconColor = accent === "blue" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400";
    const checkColor = accent === "blue" ? "text-blue-500" : "text-emerald-500";
    const priceColor = accent === "blue" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400";
    const btnClass = isShort
      ? `border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 ${isSelected ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}`
      : isSelected
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10";

    const features = plan.slug === "basic"
      ? [t("basicFeature1"), t("basicFeature2")]
      : plan.slug === "pro"
      ? [t("proFeature1", { count: plan.jobSlots }), t("proFeature2", { count: plan.durationDays })]
      : [t("shortFeature1"), t("shortFeature2", { count: plan.durationDays })];

    const onClick = isShort ? handleQuickOnly : () => { setSelectedPlan(isSelected ? null : plan); if (isSelected) setAddShortListing(false); };

    return (
      <div className={`rounded-2xl border-2 bg-white dark:bg-card-background p-6 flex flex-col cursor-pointer transition-all duration-150 ${borderClass}`} onClick={!anyLoading ? onClick : undefined}>
        <div className={`p-3 rounded-xl w-fit mb-4 ${iconBg}`}>
          {isShort ? <Clock className={`h-5 w-5 ${iconColor}`} /> : plan.slug === "pro" ? <Star className={`h-5 w-5 ${iconColor}`} /> : <Briefcase className={`h-5 w-5 ${iconColor}`} />}
        </div>
        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
        <p className="text-sm text-slate-500 dark:text-foreground/60 mt-1 mb-4">{plan.description}</p>
        <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 mb-5 space-y-2.5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
              <Check className={`h-4 w-4 shrink-0 ${checkColor}`} />
              <span>{f}</span>
              {i === 1 && plan.slug === "basic" && <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-1">
            <span className={`text-4xl font-bold ${priceColor}`}>{(plan.priceInCents / 100).toFixed(0)}€</span>
            <span className="text-sm text-slate-400 dark:text-foreground/40 pb-1">
              {isShort ? `/ ${plan.durationDays} ${t("days", { count: plan.durationDays })}` : t("perMonth")}
            </span>
          </div>
          {plan.isSubscription && (
            <p className="text-[10px] text-slate-400 dark:text-foreground/40 mb-2">{t("autoRenewsMonthly")}</p>
          )}
          <div className="flex items-center gap-2 mb-5">
            {plan.originalPriceInCents && plan.originalPriceInCents > plan.priceInCents && (
              <>
                <span className="text-sm text-slate-400 line-through">{(plan.originalPriceInCents / 100).toFixed(0)}€</span>
                <DiscountBadge
                  pct={Math.round(((plan.originalPriceInCents - plan.priceInCents) / plan.originalPriceInCents) * 100)}
                />
              </>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); if (!anyLoading) onClick(); }}
            disabled={anyLoading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {isShort
              ? (loadingQuick ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("selectPlan", { name: plan.name }))
              : isSelected
              ? t("selected")
              : t("selectPlan", { name: plan.name })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {basic && <PlanCard plan={basic} accent="blue" />}
        {/* Pro — featured */}
        {pro && (
          <div className="relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 z-10">
              <Star className="h-3 w-3 fill-white" /> {t("bestValue")}
            </span>
            <PlanCard plan={pro} accent="blue" />
          </div>
        )}
        {shortListing && <PlanCard plan={shortListing} accent="emerald" />}
      </div>

      {/* Add Short Listing toggle — only when a plan is selected */}
      {selectedPlan && shortListing && (
        <div
          className={`mb-6 rounded-2xl border-2 transition-all cursor-pointer select-none p-4 flex items-center gap-4 ${
            addShortListing
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-dashed border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-600/50 bg-white dark:bg-card-background"
          }`}
          onClick={() => !anyLoading && setAddShortListing((v) => !v)}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${addShortListing ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
            {addShortListing && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              {t("addShortListing")}
            </p>
            <p className="text-xs text-slate-500 dark:text-foreground/50 mt-0.5">
              {t("addShortListingDesc", { days: shortListing.durationDays, price: (shortListing.priceInCents / 100).toFixed(0) })}
            </p>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
            +{(shortListing.priceInCents / 100).toFixed(0)}€
          </span>
        </div>
      )}

      {/* Order summary + Pay button */}
      {selectedPlan && (
        <div className="mb-8 rounded-2xl bg-slate-50 dark:bg-card-active border border-slate-200 dark:border-slate-700/40 p-5">
          <p className="text-xs font-bold text-slate-400 dark:text-foreground/40 uppercase tracking-wider mb-3">{t("orderSummary")}</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">
                {selectedPlan.name}
                {selectedPlan.isSubscription && (
                  <span className="text-[10px] text-slate-400 ml-1">({t("monthlyRecurring")})</span>
                )}
              </span>
              <span className="font-semibold text-foreground">{(selectedPlan.priceInCents / 100).toFixed(0)}€</span>
            </div>
            {addShortListing && shortListing && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">
                  {shortListing.name}
                  <span className="text-[10px] text-slate-400 ml-1">({t("oneTime")})</span>
                </span>
                <span className="font-semibold text-foreground">{(shortListing.priceInCents / 100).toFixed(0)}€</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700/50 pt-2 flex justify-between text-sm font-bold">
              <span className="text-foreground">{t("totalToday")}</span>
              <span className="text-blue-600 dark:text-blue-400">{(total / 100).toFixed(0)}€</span>
            </div>
            {selectedPlan.isSubscription && (
              <p className="text-[11px] text-slate-500 dark:text-foreground/50 leading-relaxed">
                {t("subscriptionDisclaimer", { price: (selectedPlan.priceInCents / 100).toFixed(0) })}
              </p>
            )}
          </div>
          <button
            onClick={handlePay}
            disabled={anyLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {selectedPlan.isSubscription ? t("subscribeNow") : t("payNow")} — {(total / 100).toFixed(0)}€
          </button>
        </div>
      )}

      {/* Footnote */}
      <p className="text-xs text-slate-400 dark:text-foreground/40 mb-8">* {t("extraJobNote")}</p>

      {error && <p className="text-sm text-red-500 text-center mb-6">{error}</p>}

      {/* Trust features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShieldCheck, label: t("trustPayments"), desc: t("trustPaymentsDesc") },
          { icon: Settings, label: t("trustManagement"), desc: t("trustManagementDesc") },
          { icon: BarChart3, label: t("trustAnalytics"), desc: t("trustAnalyticsDesc") },
          { icon: HeadphonesIcon, label: t("trustSupport"), desc: t("trustSupportDesc") },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3 p-3">
            <Icon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-slate-500 dark:text-foreground/50 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-foreground/30">{t("allPlansInclude")}</p>
    </div>
  );
}
