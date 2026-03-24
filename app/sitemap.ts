import type { MetadataRoute } from "next";
import { DEMO_JOBS } from "../lib/demo-jobs";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] =
      locale === routing.defaultLocale
        ? `${SITE_URL}${path}`
        : `${SITE_URL}/${locale}${path}`;
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    { path: "/", freq: "weekly" as const, priority: 1 },
    { path: "/jobs", freq: "daily" as const, priority: 0.95 },
    { path: "/about", freq: "monthly" as const, priority: 0.8 },
    { path: "/contact", freq: "monthly" as const, priority: 0.8 },
    { path: "/privacy", freq: "yearly" as const, priority: 0.3 },
    { path: "/terms", freq: "yearly" as const, priority: 0.3 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.flatMap(
    ({ path, freq, priority }) =>
      routing.locales.map((locale) => ({
        url:
          locale === routing.defaultLocale
            ? `${SITE_URL}${path === "/" ? "" : path}`
            : `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
        lastModified: now,
        changeFrequency: freq,
        priority,
        alternates: alternates(path === "/" ? "" : path),
      }))
  );

  const jobPages: MetadataRoute.Sitemap = DEMO_JOBS.flatMap((job) =>
    routing.locales.map((locale) => ({
      url:
        locale === routing.defaultLocale
          ? `${SITE_URL}/jobs/${job.slug}`
          : `${SITE_URL}/${locale}/jobs/${job.slug}`,
      lastModified: job.datePosted ? new Date(job.datePosted) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: alternates(`/jobs/${job.slug}`),
    }))
  );

  // Published database jobs
  const dbJobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { slug: true, publishedAt: true },
  });

  const dbJobPages: MetadataRoute.Sitemap = dbJobs.flatMap((job) =>
    routing.locales.map((locale) => ({
      url:
        locale === routing.defaultLocale
          ? `${SITE_URL}/jobs/${job.slug}`
          : `${SITE_URL}/${locale}/jobs/${job.slug}`,
      lastModified: job.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: alternates(`/jobs/${job.slug}`),
    }))
  );

  return [...staticPages, ...jobPages, ...dbJobPages];
}
