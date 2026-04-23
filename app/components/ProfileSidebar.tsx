"use client";

import { motion } from "framer-motion";
import { User, Eye } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface ProfileSidebarProps {
  displayName?: string;
  email?: string;
  occupation?: string | null;
  address?: string | null;
  age?: number | null;
  profileImageUrl?: string | null;
  appliedCount?: number;
}

export function ProfileSidebar({ displayName, occupation, address, age, profileImageUrl, appliedCount = 0 }: ProfileSidebarProps) {
  const t = useTranslations("DashboardCandidate.profileSidebar");

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

        <Link
          href="/profile"
          className="w-full py-3.5 rounded-full bg-slate-50 border border-slate-100 dark:border-white/5 text-foreground text-sm font-bold hover:bg-slate-100 transition-all shadow-sm dark:bg-white dark:text-slate-900"
        >
          {t("editProfile")}
        </Link>
      </div>

      {/* Analytics Card */}
      <div className="rounded-[40px] bg-slate-50/50 dark:bg-card-background/40 p-6 border border-slate-100 dark:border-slate-800 space-y-5">

        {/* Profile View Chart Area */}
        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 rounded-full bg-slate-50 dark:bg-card-active">
                <Eye className="h-3 w-3 text-slate-400" />
             </div>
             <span className="text-xs font-bold text-foreground">345 {t("profileViews")}</span>
          </div>

          <div className="h-24 w-full relative mt-4">
            <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d="M0,60 Q25,55 50,40 T100,35 T150,45 T200,10"
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
              />
              <path
                d="M0,60 Q25,55 50,40 T100,35 T150,45 T200,10 L200,80 L0,80 Z"
                fill="url(#chartGradient)"
              />
              <motion.circle
                initial={{ r: 0 }}
                animate={{ r: 3 }}
                transition={{ delay: 1.5 }}
                cx="200" cy="10" r="3" fill="rgb(239, 68, 68)"
              />
            </svg>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="rounded-[32px] bg-white dark:bg-card-background p-5 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("searchResult")}</p>
              <h4 className="text-2xl font-bold text-foreground leading-none">22</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-2">{t("views")}</p>
           </div>
           <div className="rounded-[32px] bg-white dark:bg-card-background p-5 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("appliedJob")}</p>
              <h4 className="text-2xl font-bold text-foreground leading-none">{appliedCount}</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-2">{t("job")}</p>
           </div>
        </div>

        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("postViews")}</p>
            <h4 className="text-2xl font-bold text-foreground leading-none">268</h4>
            <p className="text-[10px] font-medium text-slate-400 mt-2">{t("views")}</p>
        </div>

        <div className="rounded-[32px] bg-white dark:bg-card-background p-6 border border-slate-50 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-foreground/40 mb-2">{t("experience")}</p>
            <h4 className="text-2xl font-bold text-foreground leading-none">5</h4>
            <p className="text-[10px] font-medium text-slate-400 mt-2">{t("month")}</p>
        </div>

      </div>
    </aside>
  );
}
