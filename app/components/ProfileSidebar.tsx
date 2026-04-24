"use client";

import { motion } from "framer-motion";
import { User, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

interface ProfileSidebarProps {
  displayName?: string;
  occupation?: string | null;
  address?: string | null;
  birthDate?: Date | string | null;
  profileImageUrl?: string | null;
  monthlyCounts?: number[];
  appTotal?: number;
  appAccepted?: number;
  cvCount?: number;
  completeness?: number;
}

function calcAge(birthDate: Date | string): number {
  const dob = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function buildChartPath(counts: number[]): { line: string; fill: string } {
  const W = 200;
  const H = 70;
  const PAD = 8;
  const n = counts.length;
  const max = Math.max(...counts, 1);

  const pts = counts.map((v, i) => ({
    x: (i / (n - 1)) * W,
    y: PAD + (1 - v / max) * (H - PAD * 2),
  }));

  // Smooth cubic bezier through points
  let line = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    line += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }

  const fill = `${line} L${W},${H} L0,${H} Z`;
  return { line, fill };
}

function last6MonthLabels(locale: string): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { month: "short" });
  });
}

export function ProfileSidebar({
  displayName,
  occupation,
  address,
  birthDate,
  profileImageUrl,
  monthlyCounts = [0, 0, 0, 0, 0, 0],
  appTotal = 0,
  appAccepted = 0,
  cvCount = 0,
  completeness = 0,
}: ProfileSidebarProps) {
  const t = useTranslations("DashboardCandidate.profileSidebar");
  const locale = useLocale();
  const age = birthDate ? calcAge(birthDate) : null;
  const { line: chartLine, fill: chartFill } = buildChartPath(monthlyCounts);
  const monthLabels = last6MonthLabels(locale);
  const peakMonth = monthlyCounts.indexOf(Math.max(...monthlyCounts));

  return (
    <aside className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="rounded-[40px] bg-white p-8 border border-slate-100 dark:border-slate-800 dark:bg-card-background shadow-sm flex flex-col items-center text-center">
        <div className="h-28 w-28 rounded-[32px] bg-slate-100 dark:bg-card-active flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 overflow-hidden">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-12 w-12 text-slate-300 dark:text-foreground/10" />
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">
          {displayName || t("fallbackName")}
        </h3>
        {(occupation || age) && (
          <p className="text-sm font-medium text-slate-500 dark:text-foreground/50 mb-1">
            {[occupation, age ? `${age} ${t("yearsOld")}` : null].filter(Boolean).join(" · ")}
          </p>
        )}
        {address && (
          <p className="text-[11px] text-slate-400 dark:text-foreground/30 mb-1 uppercase tracking-widest">
            {address}
          </p>
        )}
        <div className="mb-8" />

        {/* Profile completeness bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-foreground/40 uppercase tracking-wider">{t("profileComplete")}</span>
            <span className="text-[11px] font-bold text-navy-primary">{completeness}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-navy-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <Link
          href="/profile"
          className="w-full py-3.5 rounded-full bg-slate-50 border border-slate-100 dark:border-white/5 text-foreground text-sm font-bold hover:bg-slate-100 transition-all shadow-sm dark:bg-white dark:text-slate-900"
        >
          {t("editProfile")}
        </Link>
      </div>

      {/* Analytics Card */}
      <div className="rounded-[40px] bg-slate-50/50 dark:bg-card-background/40 p-6 border border-slate-100 dark:border-slate-800 space-y-5">

        {/* Applications Over Time Chart */}
        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-slate-50 dark:bg-card-active">
                <TrendingUp className="h-3 w-3 text-slate-400" />
              </div>
              <span className="text-xs font-bold text-foreground">{t("applicationsOverTime")}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-foreground/40">{t("last6Months")}</span>
          </div>

          {appTotal === 0 ? (
            <div className="h-24 flex items-center justify-center">
              <p className="text-xs text-slate-400 dark:text-foreground/30">{t("noApplicationsYet")}</p>
            </div>
          ) : (
            <>
              <div className="h-24 w-full mt-4">
                <svg className="w-full h-full" viewBox="0 0 200 70" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--color-navy-primary, 30 64 175))" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgb(var(--color-navy-primary, 30 64 175))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                    d={chartLine}
                    fill="none"
                    stroke="#1e40af"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d={chartFill} fill="url(#appGradient)" />
                  {/* Peak dot */}
                  <motion.circle
                    initial={{ r: 0 }}
                    animate={{ r: 3 }}
                    transition={{ delay: 1.4 }}
                    cx={(peakMonth / 5) * 200}
                    cy={8 + (1 - monthlyCounts[peakMonth] / Math.max(...monthlyCounts, 1)) * 54}
                    fill="#1e40af"
                  />
                </svg>
              </div>
              {/* Month labels */}
              <div className="flex justify-between mt-1">
                {monthLabels.map((m, i) => (
                  <span key={i} className="text-[9px] text-slate-400 dark:text-foreground/30 font-medium">{m}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[32px] bg-white dark:bg-card-background p-5 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("cvsUploaded")}</p>
            <motion.h4
              className="text-2xl font-bold text-foreground leading-none"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {cvCount}
            </motion.h4>
            <p className="text-[10px] font-medium text-slate-400 mt-2">{t("files")}</p>
          </div>
          <div className="rounded-[32px] bg-white dark:bg-card-background p-5 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("appliedJob")}</p>
            <motion.h4
              className="text-2xl font-bold text-foreground leading-none"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {appTotal}
            </motion.h4>
            <p className="text-[10px] font-medium text-slate-400 mt-2">{t("total")}</p>
          </div>
        </div>

        {/* Accepted Applications */}
        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("accepted")}</p>
          <motion.h4
            className="text-2xl font-bold text-foreground leading-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {appAccepted}
          </motion.h4>
          <p className="text-[10px] font-medium text-slate-400 mt-2">{t("applications")}</p>
        </div>

        {/* Profile Completeness block */}
        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("profileComplete")}</p>
          <motion.h4
            className={`text-2xl font-bold leading-none ${completeness === 100 ? "text-emerald-500" : "text-foreground"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {completeness}%
          </motion.h4>
          <p className="text-[10px] font-medium text-slate-400 mt-2">
            {completeness === 100 ? t("complete") : t("fillProfile")}
          </p>
        </div>

      </div>
    </aside>
  );
}
