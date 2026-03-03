"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEMO_JOBS, type DemoJob } from "@/lib/demo-jobs";

const FEATURED_JOBS = DEMO_JOBS.slice(0, 3);

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: easeCubic },
  }),
};

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "border-blue-200 bg-blue-50 text-blue-700 dark:border-transparent dark:bg-blue-500/20 dark:text-blue-300",
  Design: "border-violet-200 bg-violet-50 text-violet-700 dark:border-transparent dark:bg-violet-500/20 dark:text-violet-300",
  Marketing: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-transparent dark:bg-emerald-500/20 dark:text-emerald-300",
  Product: "border-amber-200 bg-amber-50 text-amber-700 dark:border-transparent dark:bg-amber-500/20 dark:text-amber-300",
};

export function FeaturedJobs({ jobs = FEATURED_JOBS }: { jobs?: DemoJob[] }) {
  return (
    <section className="border-b border-gray-100 bg-section-muted py-12 sm:py-16 lg:py-20 dark:border-slate-700">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: easeCubic }}
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
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-6 dark:border-slate-600 dark:bg-slate-800"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Remote
                </span>
                {job.async && (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-800 dark:border-cyan-500/50 dark:bg-cyan-500/10 dark:text-cyan-300">
                    Async-friendly
                  </span>
                )}
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[job.category] ?? ""}`}>
                  {job.category}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-navy-primary dark:text-blue-300">
                <Link href={`/jobs/${job.slug}`} className="hover:text-navy-hover dark:hover:text-blue-200">
                  {job.title}
                </Link>
              </h3>
              <div className="mt-1 flex items-center gap-2">
                {job.companyLogo && (
                  <img
                    src={job.companyLogo}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                <p className="text-sm text-gray-600 dark:text-slate-300">{job.company}</p>
              </div>
              {job.salary && (
                <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">{job.salary}</p>
              )}
              <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-slate-300">
                {job.description.split("\n")[0]}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  View more
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-navy-primary px-4 py-2 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-white"
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
            className="inline-flex items-center gap-2 rounded-lg border border-navy-primary px-5 py-2.5 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-white"
          >
            View more jobs
          </Link>
        </div>
      </div>
    </section>
  );
}
