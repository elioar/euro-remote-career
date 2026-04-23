import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { getJobBySlug, type DemoJob } from "../../../../lib/demo-jobs";
import { getPublishedJobBySlug } from "@/lib/jobs/queries";
import { JobDetailContent } from "./JobDetailContent";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

function metaDescription(job: DemoJob): string {
  const raw = job.summary ?? job.description;
  const plain = raw.replace(/\s+/g, " ").trim();
  if (plain.length <= 155) return plain;
  return plain.slice(0, 152) + "...";
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = getJobBySlug(slug) ?? (await getPublishedJobBySlug(slug));
  const t = await getTranslations({ locale, namespace: "Metadata" });

  if (!job) {
    return { title: t("jobNotFoundTitle") };
  }
  const title = t("jobDetailTitle", { title: job.title, company: job.company });
  const description = metaDescription(job);
  const canonical = `${SITE_URL}/jobs/${slug}`;
  return {
    title,
    description,
    keywords: [
      job.title,
      job.company,
      job.category,
      "remote",
      ...(job.async ? ["async", "async-friendly"] : []),
      "Euro Remote Career",
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Euro Remote Career",
      type: "website",
      locale: locale === "el" ? "el_GR" : "en_GB",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

function jobPostingSchema(job: DemoJob, slug: string) {
  const canonical = `${SITE_URL}/jobs/${slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "EU" },
    },
    jobLocationType: "TELECOMMUTE",
    url: canonical,
    directApply: true,
  };
  if (job.datePosted) schema.datePosted = job.datePosted;
  if (job.salary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: { "@type": "QuantitativeValue", value: job.salary, unitText: "YEAR" },
    };
  }
  return schema;
}

export type CandidateApplyData = {
  candidateProfileId: string;
  fullName: string;
  email: string;
  cvs: { id: string; fileName: string; storagePath: string }[];
  hasApplied: boolean;
} | null;

export default async function JobPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const job = getJobBySlug(slug) ?? (await getPublishedJobBySlug(slug));
  if (!job) notFound();

  const schema = jobPostingSchema(job, slug);

  // Always check auth so we can gate Apply for non-logged-in users
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isLoggedIn = !!authUser;
  const isEmployer = (authUser?.user_metadata?.role as string) === "EMPLOYER";

  // Fetch candidate apply data for internal DB jobs
  let candidateApplyData: CandidateApplyData = null;
  if (job.isInternalJob && job.jobDbId && authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        candidateProfile: {
          include: { cvs: { orderBy: { uploadedAt: "desc" } } },
        },
      },
    });
    if (dbUser?.role === "CANDIDATE" && dbUser.candidateProfile) {
      const existing = await prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId: job.jobDbId,
            candidateId: dbUser.candidateProfile.id,
          },
        },
      });
      candidateApplyData = {
        candidateProfileId: dbUser.candidateProfile.id,
        fullName: dbUser.candidateProfile.fullName,
        email: dbUser.candidateProfile.email,
        cvs: dbUser.candidateProfile.cvs,
        hasApplied: !!existing,
      };
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <JobDetailContent job={job} candidateApplyData={candidateApplyData} isLoggedIn={isLoggedIn} isEmployer={isEmployer} />
      </main>
      <Footer />
    </div>
  );
}
