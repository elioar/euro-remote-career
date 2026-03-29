import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import MyJobsList from "./MyJobsList";

export default async function MyJobsPage() {
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

  const employerJobs = await prisma.job.findMany({
    where: { employerId: user.employerProfile.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <MyJobsList initialJobs={JSON.parse(JSON.stringify(employerJobs))} />
      </div>
    </main>
  );
}
