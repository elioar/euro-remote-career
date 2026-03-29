import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Briefcase, User, Settings, Mail, Bell, LogOut, Eye, Send, FileText, CheckCircle } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { getTranslations } from "next-intl/server";
import { CandidateDashboardContent } from "./CandidateDashboardContent";
import { Header } from "@/app/components/Header";
import { getPublishedJobs } from "@/lib/jobs/queries";
import MyJobsList from "./my-jobs/MyJobsList";
import LatestApplications from "./LatestApplications";
import EmployerDashboardContent from "./EmployerDashboardContent";
export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Ensure app User row exists
  const ADMIN_EMAILS = ["euroremotecareer@gmail.com", "mycomments2026@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes(authUser.email!);
  const metaRole = (authUser.user_metadata?.role as string) ?? "CANDIDATE";
  const resolvedRole = isAdmin ? "ADMIN" : metaRole === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";
  const user = await prisma.user.upsert({
    where: { email: authUser.email! },
    update: { id: authUser.id, role: resolvedRole },
    create: {
      id: authUser.id,
      email: authUser.email!,
      role: resolvedRole,
    },
    include: {
      employerProfile: true,
      candidateProfile: true,
    },
  });

  // Redirect admins to admin dashboard
  if (user.role === "ADMIN") redirect("/admin");

  const isEmployer = user.role === "EMPLOYER";
  const hasProfile = isEmployer ? !!user.employerProfile : !!user.candidateProfile;
  const displayName = isEmployer
    ? user.employerProfile?.companyName
    : user.candidateProfile?.fullName;

  const employerJobs = isEmployer && user.employerProfile
    ? await prisma.job.findMany({
        where: { employerId: user.employerProfile.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const employerApplications = isEmployer && user.employerProfile
    ? await prisma.application.findMany({
        where: { job: { employerId: user.employerProfile.id } },
        include: { candidate: true, job: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const totalJobs = employerJobs.length;
  const publishedJobs = employerJobs.filter((j) => j.status === "PUBLISHED").length;
  const totalApplications = employerJobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0);
  const draftJobs = employerJobs.filter((j) => j.status === "DRAFT").length;

  if (!isEmployer) {
    const dbJobs = await getPublishedJobs();
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <CandidateDashboardContent
          displayName={displayName}
          email={authUser.email}
          dbJobs={dbJobs}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <header className="mb-10 grid grid-cols-1 gap-6 items-center lg:grid-cols-[1fr_minmax(0,2fr)_1fr]">
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold text-foreground whitespace-nowrap">
              {t("welcome")}{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-slate-500 dark:text-foreground/60 mt-1 text-lg">{t("employerSubtitle")}</p>
          </div>

          {/* Desktop Right Column - Actions & Notifications (Hidden on Mobile) */}
          <div className="hidden lg:col-span-1 lg:flex items-center justify-end gap-3">
            <Link
              href="/dashboard/post-job"
              className="px-5 py-2.5 rounded-xl bg-navy-primary text-white text-[13px] font-bold hover:bg-navy-hover transition-all shadow-md hover:shadow-lg flex items-center gap-2 group mr-2"
            >
              <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Post a Job
            </Link>

            <button
              type="button"
              aria-label="Messages"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all hover:border-navy-primary/30"
            >
              <Mail className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all relative hover:border-navy-primary/30"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Desktop Divider & Profile Info */}
          <div className="hidden lg:col-span-1 lg:flex items-center">
            <div className="h-12 w-px bg-slate-200 dark:bg-white/10 hidden lg:block shrink-0" />

            <div className="flex items-center gap-4 group ml-4">
              <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-card-active flex items-center justify-center">
                <User className="h-7 w-7 text-slate-300 dark:text-foreground/20" />
              </div>
              <div className="hidden min-[1200px]:block shrink-0">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  {displayName || user.email}
                </h3>
                <p className="text-sm font-medium text-slate-400 dark:text-foreground/40 mt-0.5">
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href="/profile"
                  className="p-2 rounded-lg text-slate-300 hover:text-navy-primary transition-colors"
                  title="Profile settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <SignOutButton iconOnly />
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE ACTIONS ROW (Clean & Modern) */}
        <div className="lg:hidden flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
          <Link
            href="/dashboard/post-job"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-navy-primary text-white text-sm font-bold shadow-xl shadow-navy-primary/20 active:scale-[0.98] transition-all"
          >
            <Briefcase className="w-5 h-5 transition-transform group-active:scale-90" />
            <span>Post a Job</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-card-background border border-foreground/10 text-foreground/70 active:bg-foreground/5 shadow-sm transition-all active:scale-95">
              <Mail className="w-5.5 h-5.5" />
            </button>
            <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-card-background border border-foreground/10 text-foreground/70 active:bg-foreground/5 shadow-sm transition-all active:scale-95 relative">
              <Bell className="w-5.5 h-5.5" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-navy-primary rounded-full border-2 border-card-background" />
            </button>
          </div>
        </div>

        {!hasProfile && (
          <div className="mb-8 p-6 rounded-2xl bg-navy-primary/5 border border-navy-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-foreground font-semibold mb-1 text-lg">{t("completeProfileTitle")}</p>
              <p className="text-foreground/60 text-sm">
                {t("completeProfileDescEmployer")}
              </p>
            </div>
            <Link
              href="/profile"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors shadow-lg shadow-navy-primary/20"
            >
              <Settings className="w-4 h-4" />
              {t("setUpProfile")}
            </Link>
          </div>
        )}

        {isEmployer && (
          <EmployerDashboardContent
            employerJobs={JSON.parse(JSON.stringify(employerJobs))}
            employerApplications={JSON.parse(JSON.stringify(employerApplications))}
            totalJobs={totalJobs}
            publishedJobs={publishedJobs}
            totalApplications={totalApplications}
            draftJobs={draftJobs}
            employerProfile={user.employerProfile ? JSON.parse(JSON.stringify(user.employerProfile)) : null}
          />
        )}
      </div>
    </main>
  );
}
