import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardContent from "./AdminDashboardContent";

export default async function AdminDashboardPage() {
  const t = await getTranslations("AdminDashboard");
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const [pendingCount, publishedCount, totalCount] = await Promise.all([
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count(),
  ]);

  const recentLogs = await prisma.moderationLog.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true, status: true } },
      admin: { select: { email: true } },
    },
  });

  return (
    <AdminDashboardContent 
      pendingCount={pendingCount}
      publishedCount={publishedCount}
      totalCount={totalCount}
      recentLogs={recentLogs}
      adminName={authUser?.user_metadata?.full_name || authUser?.email || "Admin"}
    />
  );
}

