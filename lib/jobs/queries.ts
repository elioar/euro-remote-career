import { prisma } from "@/lib/prisma";
import type { DemoJob } from "@/lib/demo-jobs";

export async function getPublishedJobs(): Promise<DemoJob[]> {
  const now = new Date();

  const jobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      employer: {
        select: { companyName: true, logoUrl: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.employer.companyName,
    companyLogo: job.employer.logoUrl ?? undefined,
    description: job.description,
    requirements: job.requirements ?? undefined,
    benefits: job.benefits ?? undefined,
    slug: job.slug,
    category: job.category as DemoJob["category"],
    location: job.location ?? "Remote",
    async: job.asyncLevel === "full" || job.asyncLevel === "friendly",
    salary: job.salary ?? undefined,
    applyUrl: job.externalApplyUrl ?? `/jobs/${job.slug}`,
    timezone: job.timezone ?? undefined,
    datePosted: job.publishedAt?.toISOString().split("T")[0],
    isInternalJob: !job.externalApplyUrl,
    jobDbId: job.id,
  }));
}

export async function getPublishedJobBySlug(slug: string): Promise<DemoJob | null> {
  const now = new Date();

  const job = await prisma.job.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      employer: {
        select: { companyName: true, logoUrl: true },
      },
    },
  });

  if (!job) return null;

  return {
    id: job.id,
    title: job.title,
    company: job.employer.companyName,
    companyLogo: job.employer.logoUrl ?? undefined,
    description: job.description,
    requirements: job.requirements ?? undefined,
    benefits: job.benefits ?? undefined,
    slug: job.slug,
    category: job.category as DemoJob["category"],
    location: job.location ?? "Remote",
    async: job.asyncLevel === "full" || job.asyncLevel === "friendly",
    salary: job.salary ?? undefined,
    applyUrl: job.externalApplyUrl ?? `/jobs/${job.slug}`,
    timezone: job.timezone ?? undefined,
    datePosted: job.publishedAt?.toISOString().split("T")[0],
    isInternalJob: !job.externalApplyUrl,
    jobDbId: job.id,
  };
}
