import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { getTranslations } from "next-intl/server";
import EditJobForm from "./EditJobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("EditJob");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { employerProfile: true },
  });

  if (!user || user.role !== "EMPLOYER" || !user.employerProfile) {
    redirect("/dashboard");
  }

  const job = await prisma.job.findUnique({ where: { id } });

  if (!job || job.employerId !== user.employerProfile.id) {
    redirect("/dashboard");
  }

  if (job.status !== "DRAFT" && job.status !== "REJECTED") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <EditJobForm
          job={JSON.parse(JSON.stringify(job))}
          companyName={user.employerProfile.companyName}
        />
      </div>
    </main>
  );
}
