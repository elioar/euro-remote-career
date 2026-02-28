"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DEMO_JOBS, type DemoJob, type JobCategory } from "../../lib/demo-jobs";

function CategoryDropdown({
  value,
  options,
  onChange,
}: {
  value: JobCategory | "";
  options: JobCategory[];
  onChange: (v: JobCategory | "") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const label = value || "All categories";

  return (
    <div className="relative w-full sm:w-40" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Category filter"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-800 shadow-sm transition-shadow focus:border-navy-primary focus:outline-none focus:ring-2 focus:ring-navy-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-2 dark:focus:ring-blue-400/30"
      >
        <span className="truncate">{label}</span>
        <svg className="h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-slate-400" style={{ transform: open ? "rotate(180deg)" : undefined }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
          >
            <li role="option" aria-selected={value === ""}>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  value === ""
                    ? "bg-navy-primary/10 font-medium text-navy-primary dark:bg-blue-400/20 dark:text-blue-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All categories
              </button>
            </li>
            {options.map((c) => (
              <li key={c} role="option" aria-selected={value === c}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    value === c
                      ? "bg-navy-primary/10 font-medium text-navy-primary dark:bg-blue-400/20 dark:text-blue-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeCubic },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const CATEGORIES: JobCategory[] = ["Tech", "Design", "Marketing", "Product"];
const PER_PAGE = 6;

const CATEGORY_COLORS: Record<JobCategory, { border: string; pill: string }> = {
  Tech: {
    border: "border-l-4 border-l-blue-400 dark:border-l-blue-500",
    pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-transparent dark:bg-blue-500/20 dark:text-blue-300",
  },
  Design: {
    border: "border-l-4 border-l-violet-400 dark:border-l-violet-500",
    pill: "border-violet-200 bg-violet-50 text-violet-700 dark:border-transparent dark:bg-violet-500/20 dark:text-violet-300",
  },
  Marketing: {
    border: "border-l-4 border-l-emerald-400 dark:border-l-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-transparent dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  Product: {
    border: "border-l-4 border-l-amber-400 dark:border-l-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-transparent dark:bg-amber-500/20 dark:text-amber-300",
  },
};

function trimDescription(text: string, maxLines = 2): string {
  const lines = text.split("\n").filter(Boolean);
  const taken = lines.slice(0, maxLines).join(" ");
  if (taken.length > 160) return taken.slice(0, 157) + "...";
  if (lines.length > maxLines) return taken + "...";
  return taken;
}

function JobCard({ job }: { job: DemoJob; index?: number }) {
  const accent = CATEGORY_COLORS[job.category];
  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${accent.border} dark:border-slate-600 dark:bg-slate-800`}
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
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.pill}`}>
          {job.category}
        </span>
      </div>
      <h2 className="mt-3">
        <Link
          href={`/jobs/${job.slug}`}
          className="font-semibold text-navy-primary hover:text-navy-hover dark:text-blue-300 dark:hover:text-blue-200"
        >
          {job.title}
        </Link>
      </h2>
      <div className="mt-1 flex items-center gap-2">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt=""
            className="h-6 w-6 shrink-0 rounded object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <p className="text-sm text-slate-600 dark:text-slate-300">{job.company}</p>
      </div>
      {job.salary && (
        <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-slate-200 dark:text-emerald-300">{job.salary}</p>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
        {trimDescription(job.description)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/jobs/${job.slug}`}
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          View more
        </Link>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-navy-primary px-4 py-2 text-sm font-medium text-navy-primary transition-colors hover:bg-navy-primary hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:border-blue-500 dark:hover:text-white"
        >
          Apply
        </a>
      </div>
    </motion.article>
  );
}

export function JobsPageContent() {
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeCubic }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[#0E1A2B] sm:text-3xl dark:text-slate-100">
            Browse Remote & Async Jobs
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Curated high-quality roles. Apply directly on the company site.
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:gap-x-8" aria-hidden>
            <li className="flex items-center gap-1.5">
              <span className="text-navy-primary dark:text-blue-400" aria-hidden>✓</span>
              Manually reviewed
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-navy-primary dark:text-blue-400" aria-hidden>✓</span>
              No spam
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-navy-primary dark:text-blue-400" aria-hidden>✓</span>
              Apply on company site
            </li>
          </ul>
        </motion.header>

        <motion.div
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easeCubic }}
        >
          <input
            type="search"
            placeholder="Keyword (title or company)"
            value={query}
            onChange={(e) => {
              updateUrl({ query: e.target.value, page: 1 });
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-shadow focus:border-navy-primary focus:outline-none focus:ring-2 focus:ring-navy-primary/20 sm:w-56 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:shadow-none dark:focus:border-blue-400 dark:focus:ring-2 dark:focus:ring-blue-400/30"
          />
          <CategoryDropdown
            value={category}
            options={CATEGORIES}
            onChange={(v) => updateUrl({ category: v, page: 1 })}
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-navy-primary has-[:checked]:bg-navy-primary/5 has-[:checked]:text-navy-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700/50 dark:has-[:checked]:border-blue-400 dark:has-[:checked]:bg-blue-400/10 dark:has-[:checked]:text-blue-300">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => {
                updateUrl({ remote: e.target.checked, page: 1 });
              }}
              className="peer sr-only"
            />
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-navy-primary/40 peer-focus-visible:ring-offset-2 peer-checked:border-navy-primary peer-checked:bg-navy-primary peer-checked:[&_.check]:opacity-100 dark:border-slate-500 dark:bg-slate-700 dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-400" aria-hidden>
              <span className="check absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity duration-200">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </span>
            <span className="pointer-events-none select-none">Remote only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-navy-primary has-[:checked]:bg-navy-primary/5 has-[:checked]:text-navy-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700/50 dark:has-[:checked]:border-blue-400 dark:has-[:checked]:bg-blue-400/10 dark:has-[:checked]:text-blue-300">
            <input
              type="checkbox"
              checked={asyncOnly}
              onChange={(e) => {
                updateUrl({ async: e.target.checked, page: 1 });
              }}
              className="peer sr-only"
            />
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-navy-primary/40 peer-focus-visible:ring-offset-2 peer-checked:border-navy-primary peer-checked:bg-navy-primary peer-checked:[&_.check]:opacity-100 dark:border-slate-500 dark:bg-slate-700 dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-400" aria-hidden>
              <span className="check absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity duration-200">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </span>
            <span className="pointer-events-none select-none">Async-friendly</span>
          </label>
        </motion.div>

        {paginated.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-500" aria-hidden />
            {filtered.length === 1 ? "1 open position" : `${filtered.length} open positions`}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {paginated.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeCubic }}
            >
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                No matching jobs found.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
                          : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
