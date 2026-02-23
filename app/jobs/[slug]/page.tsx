import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { getJobBySlug, type DemoJob } from "../../../lib/demo-jobs";
import { JobDetailContent } from "./JobDetailContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://euroremotecareer.com";

function metaDescription(job: DemoJob): string {
  const raw = job.summary ?? job.description;
  const plain = raw.replace(/\s+/g, " ").trim();
  if (plain.length <= 155) return plain;
  return plain.slice(0, 152) + "...";
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) {
    return { title: "Job Not Found | Euro Remote Career" };
  }
  const title = `${job.title} – ${job.company} | Euro Remote Career`;
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
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "EU",
      },
    },
    jobLocationType: "TELECOMMUTE",
    url: canonical,
    directApply: true,
  };
  if (job.datePosted) {
    schema.datePosted = job.datePosted;
  }
  if (job.salary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        value: job.salary,
        unitText: "YEAR",
      },
    };
  }
  return schema;
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  const schema = jobPostingSchema(job, slug);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <JobDetailContent job={job} />
      </main>
      <Footer />
    </div>
  );
}
