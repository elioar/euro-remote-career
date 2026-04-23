import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Header } from "@/app/components/Header";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  await getTranslations("Profile");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      employerProfile: true,
      candidateProfile: {
        include: { cvs: { orderBy: { uploadedAt: "desc" } } },
      },
    },
  });

  if (!user) redirect("/dashboard");

  const isEmployer = user.role === "EMPLOYER";
  const displayName = isEmployer
    ? (user.employerProfile?.companyName ?? user.email)
    : (user.candidateProfile?.fullName ?? user.email);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProfilePageClient
        role={user.role as "CANDIDATE" | "EMPLOYER" | "ADMIN"}
        email={user.email}
        displayName={displayName}
        profileImageUrl={user.candidateProfile?.profileImageUrl ?? null}
        candidateProfile={user.candidateProfile ? {
          fullName: user.candidateProfile.fullName,
          email: user.candidateProfile.email,
          address: user.candidateProfile.address,
          occupation: user.candidateProfile.occupation,
          birthDate: user.candidateProfile.birthDate?.toISOString() ?? null,
          profileImageUrl: user.candidateProfile.profileImageUrl,
          cvs: user.candidateProfile.cvs.map((cv) => ({
            id: cv.id,
            fileName: cv.fileName,
            storagePath: cv.storagePath,
            uploadedAt: cv.uploadedAt.toISOString(),
          })),
        } : null}
        employerProfile={user.employerProfile ? {
          companyName: user.employerProfile.companyName,
          logoUrl: user.employerProfile.logoUrl,
          website: user.employerProfile.website,
          description: user.employerProfile.description,
        } : null}
      />
    </main>
  );
}
