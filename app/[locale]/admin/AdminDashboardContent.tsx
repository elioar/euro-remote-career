"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  XCircle,
  Users,
  Eye
} from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  pendingCount: number;
  publishedCount: number;
  totalCount: number;
  recentLogs: any[];
  adminName: string;
}

export default function AdminDashboardContent({
  pendingCount,
  publishedCount,
  totalCount,
  recentLogs,
  adminName,
}: Props) {
  const t = useTranslations("AdminDashboard");

  // Stats Card Component
  const StatCard = ({ icon: Icon, value, label, description, colorClass, borderClass, link }: any) => {
    const CardWrapper = link ? Link : "div";
    return (
      <CardWrapper 
        href={link || "#"}
        className={`p-6 rounded-[2rem] bg-card-background border-2 ${borderClass} shadow-sm transition-all duration-300 ${link ? 'hover:shadow-xl hover:shadow-navy-primary/5 hover:-translate-y-1' : ''} group`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${colorClass.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          {link && <ArrowRight className="w-5 h-5 text-foreground/20 group-hover:text-foreground/40 transition-colors" />}
        </div>
        <div>
          <p className="text-4xl font-black text-foreground tracking-tighter mb-1">{value}</p>
          <p className="text-sm font-bold text-foreground uppercase tracking-tight">{label}</p>
          <p className="text-[11px] text-foreground/40 font-medium uppercase tracking-widest mt-1">{description}</p>
        </div>
      </CardWrapper>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-navy-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-8 h-1 bg-navy-primary rounded-full" />
            Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">
            {t("welcome")}
          </h1>
          <p className="text-foreground/50 mt-3 text-lg font-medium max-w-xl">
            You have <span className="text-navy-primary font-bold">{pendingCount} jobs</span> waiting for your technical review today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Link 
              href="/admin/review"
              className="px-6 py-3.5 rounded-2xl bg-navy-primary text-white text-sm font-bold shadow-xl shadow-navy-primary/20 hover:bg-navy-hover transition-all active:scale-[0.98] flex items-center gap-2"
            >
              Start Reviewing <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Clock} 
          value={pendingCount} 
          label={t("pendingReview")} 
          description={t("pendingDescription")}
          colorClass="text-amber-500"
          borderClass="border-amber-500/10 hover:border-amber-500/30"
          link="/admin/review"
        />
        <StatCard 
          icon={CheckCircle} 
          value={publishedCount} 
          label={t("published")} 
          description={t("publishedDescription")}
          colorClass="text-emerald-500"
          borderClass="border-emerald-500/10 hover:border-emerald-500/30"
        />
        <StatCard 
          icon={Briefcase} 
          value={totalCount} 
          label={t("totalJobs")} 
          description={t("totalJobsDescription")}
          colorClass="text-navy-primary"
          borderClass="border-navy-primary/10 hover:border-navy-primary/30"
          link="/admin/jobs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-navy-primary" />
              {t("recentActivity")}
            </h2>
          </div>

          <div className="bg-card-background border border-foreground/5 rounded-[2.5rem] overflow-hidden shadow-sm">
            {recentLogs.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-foreground/20" />
                </div>
                <p className="text-foreground/40 font-medium">{t("noJobsPending")}</p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/5">
                  {recentLogs.map((log) => {
                    // Logic: If job is currently PENDING_REVIEW, show PENDING regardless of log action
                    const isJobPending = log.job.status === "PENDING_REVIEW";
                    const displayAction = isJobPending ? "PENDING" : log.action;

                    return (
                      <div 
                        key={log.id} 
                        className="p-5 flex items-center gap-4 hover:bg-foreground/[0.01] transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-foreground/5 ${
                          displayAction === "APPROVED" ? "bg-emerald-500/10" : 
                          displayAction === "REJECTED" ? "bg-red-500/10" : 
                          "bg-amber-500/10"
                        }`}>
                          {displayAction === "APPROVED" ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : displayAction === "REJECTED" ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                              displayAction === "APPROVED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                              displayAction === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                              {displayAction}
                            </span>
                            <span className="text-foreground font-bold truncate group-hover:text-navy-primary transition-colors cursor-default">
                              {log.job.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-foreground/40 font-medium whitespace-nowrap overflow-hidden italic">
                            By <span className="text-foreground/60">{log.admin.email}</span>
                            <span>•</span>
                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="hidden sm:block">
                           <Link 
                              href={`/admin/review/${log.jobId}`}
                              className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[11px] font-bold text-foreground transition-all flex items-center gap-2"
                           >
                             {displayAction === "APPROVED" ? "View" : "Review"}
                           </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Mini Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 invisible">
            Extra
          </h2>
          
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-navy-primary to-indigo-800 text-white relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg mb-2">Platform Integrity</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Your moderation ensures that Euro Remote Career remains the #1 trusted site for remote engineering talent.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-navy-primary bg-indigo-400 flex items-center justify-center text-[8px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold">+12 Other Admins Online</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-card-background border border-foreground/10 space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Platform Growth</h4>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
             </div>
             <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-foreground/40">
                    <span>New Listings</span>
                    <span className="text-foreground font-black">+24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-navy-primary rounded-full w-[70%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-foreground/40">
                    <span>User Growth</span>
                    <span className="text-foreground font-black">+40%</span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
