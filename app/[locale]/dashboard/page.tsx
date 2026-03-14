import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Briefcase, User, Settings } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { getTranslations } from "next-intl/server";
import { CandidateDashboardContent } from "./CandidateDashboardContent";
import { Header } from "@/app/components/Header";

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

  const isEmployer = user.role === "EMPLOYER";
  const hasProfile = isEmployer ? !!user.employerProfile : !!user.candidateProfile;
  const displayName = isEmployer
    ? user.employerProfile?.companyName
    : user.candidateProfile?.fullName;

  if (!isEmployer) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <CandidateDashboardContent 
          displayName={displayName} 
          email={authUser.email} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("welcome")}{displayName ? `, ${displayName}` : ""}!
          </h1>
          <p className="text-foreground/60 mt-1">
            {user.email} &middot;{" "}
            <span className="capitalize">{user.role.toLowerCase()}</span>
          </p>
        </div>

        {!hasProfile && (
          <div className="mb-8 p-5 rounded-2xl bg-navy-primary/10 border border-navy-primary/20">
            <p className="text-foreground font-medium mb-2">{t("completeProfileTitle")}</p>
            <p className="text-foreground/60 text-sm mb-4">
              {t("completeProfileDescEmployer")}
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t("setUpProfile")}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/profile"
            className="group p-6 rounded-2xl border border-foreground/10 bg-section-muted hover:border-navy-primary/40 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-6 h-6 text-navy-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t("myProfile")}</h2>
            </div>
            <p className="text-foreground/60 text-sm">
              {t("myProfileDescEmployer")}
            </p>
          </Link>

          <div className="p-6 rounded-2xl border border-foreground/10 bg-section-muted opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-6 h-6 text-foreground/40" />
              <h2 className="text-lg font-semibold text-foreground">
                {t("postAJob")}
              </h2>
            </div>
            <p className="text-foreground/60 text-sm">{t("comingSoon")}</p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-foreground/10">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
