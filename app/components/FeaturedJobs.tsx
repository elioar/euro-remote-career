"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type JobItem = {
  id: string;
  title: string;
  company: string;
  description: string;
  slug: string;
  applyUrl: string;
};

const defaultJobs: JobItem[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Tech Co",
    description: "Build modern web apps with React. Fully remote, EU timezone-friendly.",
    slug: "senior-frontend-engineer",
    applyUrl: "https://example.com/apply/1",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Design Studio",
    description: "Own product design for a B2B SaaS. Async-first team.",
    slug: "product-designer",
    applyUrl: "https://example.com/apply/2",
  },
  {
    id: "3",
    title: "Content Marketing Lead",
    company: "Growth Inc",
    description: "Lead content strategy and SEO. Remote, flexible hours.",
    slug: "content-marketing-lead",
    applyUrl: "https://example.com/apply/3",
  },
];

type FeaturedJobsProps = {
  jobs?: JobItem[];
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function FeaturedJobs({ jobs = defaultJobs }: FeaturedJobsProps) {
  return (
    <section className="border-b border-gray-100 bg-section-muted py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl"
        >
          Featured Jobs
        </motion.h2>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <motion.article
              key={job.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-24px" }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  Remote
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-navy-primary">
                <Link href={`/jobs/${job.slug}`} className="hover:text-navy-hover">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-600">{job.company}</p>
              <p className="mt-3 text-sm text-gray-600">{job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  View more
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-navy-primary px-4 py-2 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white"
                  >
                    Apply
                  </a>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-navy-primary px-5 py-2.5 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white"
          >
            View more jobs
          </Link>
        </div>
      </div>
    </section>
  );
}
