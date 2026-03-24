import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Briefcase, User, Settings } from "lucide-react";
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
  const role = (authUser.user_metadata?.role as string) ?? "CANDIDATE";
  const user = await prisma.user.upsert({
    where: { email: authUser.email! },
    update: { id: authUser.id },
    create: {
      id: authUser.id,
      email: authUser.email!,
      role: role === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE",
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
              {t("welcome")}{displayName ? `, ${displayName}` : ""} <span className="text-2xl">👋</span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-foreground/50 font-medium">
              <span>{user.email}</span>
              <span className="w-1 h-1 rounded-full bg-foreground/30" />
              <span className="capitalize tracking-wide text-navy-primary">{user.role.toLowerCase()}</span>
            </div>
          </div>
          <div>
            <SignOutButton />
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Applied Candidates */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Latest Applications</h3>
                <div className="p-5 rounded-3xl bg-card-background border border-foreground/10 overflow-hidden shadow-sm">
                  {employerApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 rounded-full bg-navy-primary/10 flex items-center justify-center mx-auto mb-3">
                        <User className="w-5 h-5 text-navy-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No applications yet</p>
                      <p className="text-xs text-foreground/40 mt-1">When candidates apply, they will show up here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {employerApplications.map((app) => (
                        <div key={app.id} className="pb-4 border-b border-foreground/5 last:border-0 last:pb-0">
                          <p className="font-bold text-foreground text-sm truncate">{app.candidate.fullName}</p>
                          <p className="text-xs text-navy-primary font-medium mt-0.5 truncate">{app.job.title}</p>
                          <p className="text-[11px] text-foreground/40 mt-1.5">{new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: My Jobs */}
            <div className="lg:col-span-6">
              <MyJobsList initialJobs={JSON.parse(JSON.stringify(employerJobs))} />
            </div>

            {/* Column 3: Quick Actions */}
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

                <Link
                  href="/profile"
                  className="group block p-6 rounded-3xl bg-card-background border border-foreground/10 hover:border-navy-primary/30 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-navy-primary/5 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-background border border-foreground/10 flex items-center justify-center mb-4 text-navy-primary transition-colors group-hover:bg-navy-primary/10">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-1.5">Company Profile</h2>
                    <p className="text-foreground/50 text-[13px] leading-relaxed">
                      Manage your logo, website, and info.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
