import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ReviewQueuePage() {
  const t = await getTranslations("AdminReview");

  const jobs = await prisma.job.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      employer: {
        select: { companyName: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("pageTitle")}</h1>

      {jobs.length === 0 ? (
        <p className="text-foreground/50 py-12 text-center">{t("noJobs")}</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/admin/review/${job.id}`}
              className="block p-4 rounded-2xl border border-foreground/10 bg-section-muted hover:border-navy-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-foreground/50 mt-0.5">
                    {job.employer.companyName} · {job.category} · {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Pending
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
