import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ARCHIVED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  EXPIRED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default async function AdminAllJobsPage() {
  const t = await getTranslations("AdminReview");

  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        select: { companyName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("allJobsTitle")}</h1>

      {jobs.length === 0 ? (
        <p className="text-foreground/50 py-12 text-center">{t("noJobs")}</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/admin/review/${job.id}`}
              className="block p-4 rounded-2xl border border-foreground/10 bg-section-muted hover:border-foreground/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                  <p className="text-sm text-foreground/50 mt-0.5">
                    {job.employer.companyName} · {job.category} · {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ml-3 ${STATUS_COLORS[job.status] || ""}`}
                >
                  {job.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
