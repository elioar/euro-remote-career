"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { FileText, CheckCircle, Send, Eye, ShieldCheck, Zap, LifeBuoy, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import MyJobsList from "./my-jobs/MyJobsList";
import LatestApplications, { type RealApplication } from "./LatestApplications";

type JobData = any;
type ApplicationData = RealApplication;

interface ActivePlan {
  subscriptionId: string;
  name: string;
  slug: string;
  basePlanSlots: number;
  totalSlots: number;
  slotsUsed: number;
  daysLeft: number;
  cancelAtPeriodEnd: boolean;
  status: string;
}

interface Props {
  employerJobs: JobData[];
  employerApplications: ApplicationData[];
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  draftJobs: number;
  employerProfile: {
    companyName: string;
    logoUrl: string | null;
    website: string | null;
    description: string | null;
  } | null;
  activePlan?: ActivePlan | null;
  activeQuickListings?: number;
  totalQuickListings?: number;
  unusedShortListingPaymentId?: string | null;
  unusedShortListingsCount?: number;
  unusedExtraJobSlots?: number;
  usedExtraJobSlots?: number;
}

export default function EmployerDashboardContent({
  employerJobs,
  employerApplications,
  totalJobs,
  publishedJobs,
  totalApplications,
  draftJobs,
  employerProfile,
  activePlan = null,
  activeQuickListings = 0,
  totalQuickListings = 0,
  unusedShortListingPaymentId = null,
  unusedShortListingsCount: _unusedShortListingsCount = 0,
  unusedExtraJobSlots = 0,
  usedExtraJobSlots = 0,
}: Props) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"applications" | "jobs">("applications");
  const [portalLoading, setPortalLoading] = useState(false);
  void _unusedShortListingsCount;

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/employer/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  // Calculate Profile Strength
  const profileSteps = [
    { label: t("profileCompanyName"), done: !!employerProfile?.companyName },
    { label: t("profileCompanyLogo"), done: !!employerProfile?.logoUrl },
    { label: t("profileWebsite"), done: !!employerProfile?.website },
    { label: t("profileDescription"), done: !!employerProfile?.description },
  ];
  const completedSteps = profileSteps.filter(s => s.done).length;
  const strengthPercentage = Math.round((completedSteps / profileSteps.length) * 100);

  // Total Views across all jobs (simulated for now, like in MyJobsList)
  const totalViews = employerJobs.reduce((sum, job) => sum + (job.viewCount ?? 0), 0);

  // Stats Card Component for reuse
  const MiniStat = ({ icon: Icon, value, label, colorClass }: any) => (
    <div className="p-4 rounded-2xl bg-card-background border border-foreground/10 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${colorClass}/10 flex items-center justify-center shrink-0`}>
        <Icon className={`w-4.5 h-4.5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-foreground/50 mt-1 uppercase tracking-wider font-bold">{label}</p>
      </div>
    </div>
  );

  const QuickActionsContent = () => (
    <div className="space-y-4">
      {/* Subscription / Credits Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
          <Zap className="w-20 h-20" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              {activePlan ? activePlan.name : t("freePlan")}
            </span>
            {activePlan && (
              <span
                className={`text-[10px] ${
                  activePlan.daysLeft <= 7 ? "text-amber-200 font-bold" : "text-white/60"
                }`}
                title={t("renewsIn", { days: activePlan.daysLeft })}
              >
                {activePlan.cancelAtPeriodEnd
                  ? t("endsInDays", { days: activePlan.daysLeft })
                  : t("renewsInDays", { days: activePlan.daysLeft })}
              </span>
            )}
            {activePlan?.cancelAtPeriodEnd && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-100 text-[9px] font-bold uppercase tracking-wider">
                {t("canceling")}
              </span>
            )}
          </div>
          {/* Empty state explanation */}
          {!activePlan && (
            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              {t("noPlanDesc")}
            </p>
          )}
          {/* Stats row */}
          {activePlan && (
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div>
                <p className="text-[10px] text-white/60 mb-0.5">{t("postingSlots")}</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold">
                    {activePlan.slotsUsed}/{activePlan.totalSlots}
                  </span>
                </div>
                <span className="text-xs text-white/50">{t("used")}</span>
              </div>
              {(unusedExtraJobSlots + usedExtraJobSlots) > 0 && (
                <div className="border-l border-white/20 pl-4">
                  <p className="text-[10px] text-white/60 mb-0.5">{t("extraSlots")}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{usedExtraJobSlots}/{usedExtraJobSlots + unusedExtraJobSlots}</span>
                  </div>
                  <span className="text-xs text-white/50">{t("used")}</span>
                </div>
              )}
              {totalQuickListings > 0 && (
                <div className="border-l border-white/20 pl-4">
                  <p className="text-[10px] text-white/60 mb-0.5">{t("quickListings")}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{activeQuickListings}/{totalQuickListings}</span>
                  </div>
                  <span className="text-xs text-white/50">{t("active")}</span>
                </div>
              )}
            </div>
          )}
          {/* Expiry warning */}
          {activePlan && activePlan.daysLeft <= 7 && !activePlan.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-300/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="text-[10px] text-amber-100 font-medium">
                {t("renewalSoonHint", { days: activePlan.daysLeft })}
              </span>
            </div>
          )}
          {/* Buttons */}
          <div className="flex flex-col gap-2">
            {unusedShortListingPaymentId && (
              <Link
                href={`/dashboard/post-job?slPaymentId=${unusedShortListingPaymentId}`}
                className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {t("postShortListingJob")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {!activePlan && (
              <Link
                href="/checkout"
                className="w-full py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {t("getStarted")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {activePlan && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-60"
              >
                {portalLoading ? "…" : t("manageSubscription")}
              </button>
            )}
            <Link
              href="/dashboard/billing"
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {t("billingHistory")}
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Strength Card */}
      {strengthPercentage < 100 && (
        <div className="p-5 rounded-3xl bg-card-background border border-foreground/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">{t("profileStrength")}</h4>
              <p className="text-[10px] text-foreground/50 tracking-wider font-bold">{t("excellentReach")}</p>
            </div>
            <span className={`text-lg font-bold ${strengthPercentage === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
              {strengthPercentage}%
            </span>
          </div>
          <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full transition-all duration-1000 ${strengthPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
              style={{ width: `${strengthPercentage}%` }} 
            />
          </div>
          <div className="space-y-2">
            {profileSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <ShieldCheck className={`w-3.5 h-3.5 ${step.done ? 'text-emerald-500' : 'text-foreground/20'}`} />
                <span className={step.done ? 'text-foreground font-medium' : 'text-foreground/40'}>{step.label}</span>
              </div>
            ))}
          </div>
          <Link href="/profile" className="mt-4 block py-2 text-center rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground transition-colors">
            {t("completeProfile")}
          </Link>
        </div>
      )}

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-2xl bg-card-background border border-foreground/10 flex items-center justify-between group hover:border-navy-primary/30 transition-colors cursor-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-navy-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/50 font-bold tracking-tight">{t("totalVisibility")}</p>
              <p className="text-xl font-black text-foreground">{totalViews.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">+12%</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniStat icon={FileText} value={totalJobs} label={t("totalJobs")} colorClass="text-blue-500" />
          <MiniStat icon={CheckCircle} value={publishedJobs} label={t("published")} colorClass="text-green-500" />
          <MiniStat icon={Send} value={totalApplications} label={t("applications")} colorClass="text-emerald-500" />
          <MiniStat icon={Eye} value={draftJobs} label={t("drafts")} colorClass="text-amber-500" />
        </div>
      </div>

      {/* Support Card */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-card-active border-2 border-dashed border-foreground/5 group hover:border-navy-primary/20 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-card-background shadow-sm flex items-center justify-center shrink-0 border border-foreground/5">
            <LifeBuoy className="w-5 h-5 text-navy-primary group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground mb-1">{t("hiringHelp")}</h4>
            <p className="text-[11px] text-foreground/50 leading-relaxed mb-3">{t("hiringHelpDesc")}</p>
            <button className="text-xs font-bold text-navy-primary flex items-center gap-1.5 hover:gap-2.5 transition-all">
              {t("contactSupport")} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE LAYOUT (< lg) */}
      <div className="lg:hidden space-y-8">
        <QuickActionsContent />

        {/* Tab Switcher */}
        <div className="bg-card-background border border-foreground/10 rounded-2xl p-1.5 flex items-center gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "applications"
                ? "bg-navy-primary text-white shadow-md"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {t("applications")}
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "jobs"
                ? "bg-navy-primary text-white shadow-md"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {t("myJobs")}
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "jobs" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MyJobsList initialJobs={employerJobs} locale={locale} />
            </div>
          )}
          {activeTab === "applications" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <LatestApplications initialApplications={employerApplications} />
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= lg) */}
      <div className="hidden lg:grid grid-cols-12 gap-8">
        {/* Column 1: Applications (sidebar) */}
        <div className="col-span-3">
          <LatestApplications initialApplications={employerApplications} />
        </div>

        {/* Column 2: My Jobs (full featured) */}
        <div className="col-span-6">
          <MyJobsList initialJobs={employerJobs} locale={locale} />
        </div>

        {/* Column 3: Quick Actions & Stats */}
        <div className="col-span-3">
          <div className="sticky top-24 space-y-4">
            <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-tighter">{t("accountCenter")}</h3>
            <QuickActionsContent />
          </div>
        </div>
      </div>
    </>
  );
}
