import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { getTranslations } from "next-intl/server";
import PostJobForm from "./PostJobForm";

export default async function PostJobPage() {
  const t = await getTranslations("PostJob");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { employerProfile: true },
  });

  if (!user || user.role !== "EMPLOYER") redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <PostJobForm
          hasProfile={!!user.employerProfile}
          companyName={user.employerProfile?.companyName}
        />
      </div>
    </main>
  );
}
