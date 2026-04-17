import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { MyApplications } from "../MyApplications";
import { Briefcase, Star, Eye, Clock, XCircle, TrendingUp, Lightbulb, User, Mail, Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { candidateProfile: true },
  });

  if (!user || user.role !== "CANDIDATE") redirect("/dashboard");

  const applications = user.candidateProfile
    ? await prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: {
          job: {
            include: { employer: { select: { companyName: true, logoUrl: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const total       = applications.length;
  const shortlisted = applications.filter(a => a.status === "ACCEPTED").length;
  const reviewing   = applications.filter(a => a.status === "REVIEWING").length;
  const rejected    = applications.filter(a => a.status === "REJECTED").length;
  const cvViewed    = applications.filter(a => a.cvViewedAt !== null).length;
  const pending     = applications.filter(a => a.status === "PENDING").length;

  const tips = [
    "Tailor your cover letter for each role — generic ones get ignored.",
    "Follow up after 1 week if you haven't heard back.",
    "Keep your profile up to date with recent projects.",
    "Apply early — first applicants get more attention.",
  ];
  const tip = tips[new Date().getDay() % tips.length];

  const displayName = user.candidateProfile?.fullName ?? authUser.email?.split("@")[0] ?? "Candidate";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">

        {/* Header — same 3-col grid as dashboard */}
        <header className="mb-10 grid grid-cols-1 gap-6 items-center lg:grid-cols-[1fr_minmax(0,2fr)_1fr]">
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold text-foreground whitespace-nowrap">My Applications</h1>
            <p className="text-slate-500 dark:text-foreground/60 mt-1 text-lg">
              Track every step of your job search
            </p>
          </div>

          {/* Middle — Mail & Bell */}
          <div className="hidden lg:col-span-1 lg:flex items-center justify-end gap-5">
            <button type="button" className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all">
              <Mail className="h-4.5 w-4.5" />
            </button>
            <button type="button" className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all">
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Right — Profile */}
          <div className="hidden lg:col-span-1 lg:flex items-center">
            <div className="h-12 w-px bg-slate-200 dark:bg-white/10 hidden lg:block shrink-0" />
            <div className="flex items-center gap-4 ml-4">
              <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-card-active flex items-center justify-center">
                <User className="h-7 w-7 text-slate-300 dark:text-foreground/20" />
              </div>
              <div className="hidden min-[1200px]:block">
                <h3 className="text-base font-bold text-foreground leading-tight">{displayName}</h3>
                <p className="text-sm font-medium text-slate-400 dark:text-foreground/40 mt-0.5">{authUser.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3-column grid — same as dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] gap-6 items-start">

          {/* Col 1 — Stats */}
          <div className="self-start flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-foreground/10 bg-card-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-navy-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Overview</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total",       value: total,       color: "navy-primary", bg: "navy-primary/5",  border: "navy-primary/15", icon: <Briefcase className="w-3.5 h-3.5 text-navy-primary" /> },
                  { label: "Applied",     value: pending,     color: "blue-500",     bg: "blue-500/5",      border: "blue-500/15",     icon: <Clock className="w-3.5 h-3.5 text-blue-500" /> },
                  { label: "Reviewed",    value: reviewing,   color: "amber-500",    bg: "amber-500/5",     border: "amber-500/15",    icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
                  { label: "Shortlisted", value: shortlisted, color: "emerald-500",  bg: "emerald-500/5",   border: "emerald-500/15",  icon: <Star className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: "CV Viewed",   value: cvViewed,    color: "violet-500",   bg: "violet-500/5",    border: "violet-500/15",   icon: <Eye className="w-3.5 h-3.5 text-violet-500" /> },
                  { label: "Rejected",    value: rejected,    color: "red-400",      bg: "red-500/5",       border: "red-500/15",      icon: <XCircle className="w-3.5 h-3.5 text-red-400" /> },
                ].map(({ label, value, color, bg, border, icon }) => (
                  <div key={label} className={`rounded-xl bg-${bg} border border-${border} p-3`}>
                    <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide">{label}</span></div>
                    <p className={`text-2xl font-black text-${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="mt-4 pt-4 border-t border-foreground/5">
                  <div className="flex justify-between text-[11px] text-foreground/40 mb-1.5">
                    <span>Success rate</span>
                    <span>{Math.round((shortlisted / total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-foreground/10">
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round((shortlisted / total) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Col 2 — Applications list */}
          <div className="min-h-0">
            <MyApplications applications={JSON.parse(JSON.stringify(applications))} />
          </div>

          {/* Col 3 — Tip + quick links */}
          <div className="self-start flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400">Daily Tip</h2>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{tip}</p>
            </div>

            <div className="rounded-2xl border border-foreground/10 bg-card-background p-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Quick Links</h2>
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-foreground/10 text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
                  <Briefcase className="w-4 h-4" /> Browse Jobs
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-foreground/10 text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
                  <User className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
