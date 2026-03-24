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

          {/* Middle column - Mail & Bell Icons */}
          <div className="hidden lg:col-span-1 lg:flex items-center justify-end gap-5">
            <button
              type="button"
              aria-label="Messages"
              className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all"
            >
              <Mail className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all relative"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Right column - Divider & Profile */}
          <div className="hidden lg:col-span-1 lg:flex items-center">
            <div className="h-12 w-px bg-slate-200 dark:bg-white/10 hidden lg:block shrink-0" />

            <div className="flex items-center gap-4 group ml-4">
              <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-card-active flex items-center justify-center">
                <User className="h-7 w-7 text-slate-300 dark:text-foreground/20" />
              </div>
              <div className="hidden min-[1200px]:block">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Latest Applications */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Latest Applications</h3>
                <div className="rounded-3xl bg-card-background border border-foreground/10 overflow-hidden shadow-sm divide-y divide-foreground/5">
                  {[
                    { name: "Maria Papadopoulou", role: "Senior Frontend Engineer", time: "2h ago", status: "new" },
                    { name: "Alexandros Nikos", role: "Product Designer", time: "5h ago", status: "new" },
                    { name: "Sofia Karagianni", role: "Marketing Lead", time: "1d ago", status: "reviewed" },
                    { name: "Dimitris Vlachos", role: "Full Stack Developer", time: "2d ago", status: "reviewed" },
                    { name: "Elena Martins", role: "Senior Frontend Engineer", time: "3d ago", status: "shortlisted" },
                  ].map((app, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-primary/20 to-navy-primary/5 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">{app.name.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate">{app.name}</p>
                        <p className="text-xs text-blue-400 font-medium truncate">{app.role}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-foreground/40">{app.time}</p>
                        {app.status === "new" && (
                          <span className="inline-block mt-1 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        {app.status === "shortlisted" && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500">TOP</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: My Jobs */}
            <div className="lg:col-span-6">
              <MyJobsList initialJobs={JSON.parse(JSON.stringify(employerJobs))} />
            </div>

            {/* Column 3: Quick Actions & Stats */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-4">
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>

                <Link
                  href="/dashboard/post-job"
                  className="group block p-6 rounded-3xl bg-navy-primary text-white hover:bg-navy-hover transition-all duration-300 relative overflow-hidden shadow-md hover:shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1.5">Post a Job</h2>
                    <p className="text-white/80 text-[13px] leading-relaxed">
                      Create a new job and hire remote talent.
                    </p>
                  </div>
                </Link>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-card-background border border-foreground/10">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                      <FileText className="w-4.5 h-4.5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalJobs}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Total Jobs</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card-background border border-foreground/10">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                      <CheckCircle className="w-4.5 h-4.5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{publishedJobs}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Published</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card-background border border-foreground/10">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                      <Send className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Applications</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card-background border border-foreground/10">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                      <Eye className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{draftJobs}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Drafts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
