import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  const t = await getTranslations("AdminDashboard");

  const [pendingCount, publishedCount, totalCount] = await Promise.all([
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count(),
  ]);

  const recentLogs = await prisma.moderationLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true } },
      admin: { select: { email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("pageTitle")}</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/review"
          className="p-5 rounded-2xl border border-foreground/10 bg-section-muted hover:border-navy-primary/40 transition-all"
        >
          <p className="text-sm text-foreground/60 mb-1">{t("pendingReview")}</p>
          <p className="text-3xl font-bold text-navy-primary">{pendingCount}</p>
        </Link>
        <div className="p-5 rounded-2xl border border-foreground/10 bg-section-muted">
          <p className="text-sm text-foreground/60 mb-1">{t("published")}</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{publishedCount}</p>
        </div>
        <Link
          href="/admin/jobs"
          className="p-5 rounded-2xl border border-foreground/10 bg-section-muted hover:border-navy-primary/40 transition-all"
        >
          <p className="text-sm text-foreground/60 mb-1">{t("totalJobs")}</p>
          <p className="text-3xl font-bold text-foreground">{totalCount}</p>
        </Link>
      </div>

      {/* Recent activity */}
      <h2 className="text-lg font-semibold text-foreground mb-4">{t("recentActivity")}</h2>
      {recentLogs.length === 0 ? (
        <p className="text-foreground/50 text-sm">{t("noJobsPending")}</p>
      ) : (
        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-section-muted text-sm"
            >
              <span className="font-medium text-foreground">{log.action}</span>
              <span className="text-foreground/50">—</span>
              <span className="text-foreground/70 truncate">{log.job.title}</span>
              <span className="ml-auto text-foreground/40 text-xs whitespace-nowrap">
                {log.admin.email} · {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
