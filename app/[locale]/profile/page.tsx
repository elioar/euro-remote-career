import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import EmployerProfileForm from "./EmployerProfileForm";
import CandidateProfileForm from "./CandidateProfileForm";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      employerProfile: true,
      candidateProfile: true,
    },
  });

  if (!user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-foreground/60 mt-1">{user.email}</p>
        </div>

        {user.role === "EMPLOYER" ? (
          <EmployerProfileForm profile={user.employerProfile} />
        ) : (
          <CandidateProfileForm profile={user.candidateProfile} userEmail={user.email} />
        )}
      </div>
    </main>
  );
}
