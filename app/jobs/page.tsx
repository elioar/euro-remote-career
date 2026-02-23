"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DEMO_JOBS, type DemoJob, type JobCategory } from "../../lib/demo-jobs";

const ease = [0.22, 1, 0.36, 1] as const;
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const CATEGORIES: JobCategory[] = ["Tech", "Design", "Marketing", "Product"];
const PER_PAGE = 6;

function trimDescription(text: string, maxLines = 2): string {
  const lines = text.split("\n").filter(Boolean);
  const taken = lines.slice(0, maxLines).join(" ");
  if (taken.length > 160) return taken.slice(0, 157) + "...";
  if (lines.length > maxLines) return taken + "...";
  return taken;
}

function JobCard({ job }: { job: DemoJob; index?: number }) {
  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          Remote
        </span>
        {job.async && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Async-friendly
          </span>
        )}
      </div>
      <h2 className="mt-3">
        <Link
          href={`/jobs/${job.slug}`}
          className="font-semibold text-navy-primary hover:text-navy-hover"
        >
          {job.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-slate-600">{job.company}</p>
      {job.salary && (
        <p className="mt-2 text-sm font-medium text-slate-800">{job.salary}</p>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {trimDescription(job.description)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/jobs/${job.slug}`}
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          View more
        </Link>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-navy-primary px-4 py-2 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white"
        >
          Apply
        </a>
      </div>
    </motion.article>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") ?? "";
  const category = (searchParams.get("category") as JobCategory) ?? "";
  const remoteOnly = searchParams.get("remote") === "true";
  const asyncOnly = searchParams.get("async") === "true";
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );

  const updateUrl = useCallback(
    (updates: {
      query?: string;
      category?: string;
      remote?: boolean;
      async?: boolean;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.query !== undefined) {
        if (updates.query) params.set("query", updates.query);
        else params.delete("query");
      }
      if (updates.category !== undefined) {
        if (updates.category) params.set("category", updates.category);
        else params.delete("category");
      }
      if (updates.remote !== undefined) {
        if (updates.remote) params.set("remote", "true");
        else params.delete("remote");
      }
      if (updates.async !== undefined) {
        if (updates.async) params.set("async", "true");
        else params.delete("async");
      }
      if (updates.page !== undefined) {
        if (updates.page > 1) params.set("page", String(updates.page));
        else params.delete("page");
      }
      const qs = params.toString();
      router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    let list = [...DEMO_JOBS];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((j) => j.category === category);
    }
    if (remoteOnly) {
      list = list.filter((j) => j.location === "Remote");
    }
    if (asyncOnly) {
      list = list.filter((j) => j.async === true);
    }
    return list;
  }, [query, category, remoteOnly, asyncOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filtered, safePage]
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[#0E1A2B] sm:text-3xl">
            Browse Remote & Async Jobs
          </h1>
          <p className="mt-2 text-slate-600">
            Curated high-quality roles. Apply directly on the company site.
          </p>
        </motion.header>

        <motion.div
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
        >
          <input
            type="search"
            placeholder="Keyword (title or company)"
            value={query}
            onChange={(e) => {
              updateUrl({ query: e.target.value, page: 1 });
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-navy-primary focus:outline-none focus:ring-1 focus:ring-navy-primary sm:w-56"
          />
          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value as JobCategory | "";
              updateUrl({ category: v, page: 1 });
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 sm:w-40"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => {
                updateUrl({ remote: e.target.checked, page: 1 });
              }}
              className="h-4 w-4 rounded border-slate-300 text-navy-primary focus:ring-navy-primary"
            />
            Remote only
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={asyncOnly}
              onChange={(e) => {
                updateUrl({ async: e.target.checked, page: 1 });
              }}
              className="h-4 w-4 rounded border-slate-300 text-navy-primary focus:ring-navy-primary"
            />
            Async-friendly
          </label>
        </motion.div>

        <AnimatePresence mode="wait">
          {paginated.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <p className="text-lg font-medium text-slate-800">
                No matching jobs found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your filters.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="grid gap-4 sm:gap-5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((job, i) => (
                  <motion.div
                    key={job.id}
                    layout
                    variants={cardVariants}
                    custom={i}
                    exit="exit"
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {paginated.length > 0 && (
          <>
            {filtered.length > PER_PAGE && (
              <motion.nav
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
                aria-label="Pagination"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    updateUrl({ page: Math.max(1, safePage - 1) });
                  }}
                  disabled={safePage <= 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        updateUrl({ page: p });
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                        p === safePage
                          ? "border-navy-primary bg-navy-primary text-white"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    updateUrl({ page: Math.min(totalPages, safePage + 1) });
                  }}
                  disabled={safePage >= totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </motion.nav>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
