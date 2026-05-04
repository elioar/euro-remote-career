"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Star, Clock, Check, ShieldCheck, BarChart3, Settings, HeadphonesIcon, Tag, Info } from "lucide-react";
import type { Plan } from "@/lib/generated/prisma";

type LoadingSlug = string | null;

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
  const [loading, setLoading] = useState<LoadingSlug>(null);
  const [error, setError] = useState<string | null>(null);

  const basic = plans.find((p) => p.slug === "basic");
  const pro = plans.find((p) => p.slug === "pro");
  const shortListing = plans.find((p) => p.slug === "short-listing");

  async function handleSelect(plan: Plan) {
    setLoading(plan.slug);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, planId: plan.id, locale }),
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

  const anyLoading = loading !== null;

  return (
    <div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Basic Plan */}
        {basic && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-card-background p-6 flex flex-col">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-card-active w-fit mb-4">
              <Briefcase className="h-5 w-5 text-slate-500 dark:text-foreground/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{basic.name}</h3>
            <p className="text-sm text-slate-500 dark:text-foreground/60 mt-1 mb-4">{basic.description}</p>
            <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 mb-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                {t("basicFeature1")}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                <span>{t("basicFeature2")}</span>
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {(basic.priceInCents / 100).toFixed(0)}€
                </span>
                <span className="text-sm text-slate-400 dark:text-foreground/40 pb-1">{t("perMonth")}</span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                {basic.originalPriceInCents && (
                  <span className="text-sm text-slate-400 line-through">
                    {(basic.originalPriceInCents / 100).toFixed(0)}€
                  </span>
                )}
                <DiscountBadge pct={80} />
              </div>
              <button
                onClick={() => handleSelect(basic)}
                disabled={anyLoading}
                className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
              >
                {loading === "basic" ? "..." : t("selectPlan", { name: basic.name })}
              </button>
            </div>
          </div>
        )}

        {/* Pro Plan — featured */}
        {pro && (
          <div className="rounded-2xl border-2 border-blue-500 dark:border-blue-500 bg-white dark:bg-card-background p-6 flex flex-col relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" /> {t("bestValue")}
            </span>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 w-fit mb-4">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{pro.name}</h3>
            <p className="text-sm text-slate-500 dark:text-foreground/60 mt-1 mb-4">{pro.description}</p>
            <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 mb-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                {t("proFeature1", { count: pro.jobSlots })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-blue-500 shrink-0" />
                {t("proFeature2", { count: pro.durationDays })}
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {(pro.priceInCents / 100).toFixed(0)}€
                </span>
                <span className="text-sm text-slate-400 dark:text-foreground/40 pb-1">{t("perMonth")}</span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                {pro.originalPriceInCents && (
                  <span className="text-sm text-slate-400 line-through">
                    {(pro.originalPriceInCents / 100).toFixed(0)}€
                  </span>
                )}
                <DiscountBadge pct={80} />
              </div>
              <button
                onClick={() => handleSelect(pro)}
                disabled={anyLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading === "pro" ? "..." : t("selectPlan", { name: pro.name })}
              </button>
            </div>
          </div>
        )}

        {/* Short Listing */}
        {shortListing && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-card-background p-6 flex flex-col">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 w-fit mb-4">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{shortListing.name}</h3>
            <p className="text-sm text-slate-500 dark:text-foreground/60 mt-1 mb-4">{shortListing.description}</p>
            <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 mb-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                {t("shortFeature1")}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-foreground/70">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                {t("shortFeature2", { count: shortListing.durationDays })}
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(shortListing.priceInCents / 100).toFixed(0)}€
                </span>
                <span className="text-sm text-slate-400 dark:text-foreground/40 pb-1">
                  / {shortListing.durationDays} {t("days", { count: shortListing.durationDays })}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                {shortListing.originalPriceInCents && (
                  <span className="text-sm text-slate-400 line-through">
                    {(shortListing.originalPriceInCents / 100).toFixed(0)}€
                  </span>
                )}
                <DiscountBadge pct={80} />
              </div>
              <button
                onClick={() => handleSelect(shortListing)}
                disabled={anyLoading}
                className="w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
              >
                {loading === "short-listing" ? "..." : t("selectPlan", { name: shortListing.name })}
              </button>
            </div>
          </div>
        )}
      </div>

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
