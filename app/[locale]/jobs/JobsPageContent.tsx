"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, MapPin, Banknote, CalendarDays, ExternalLink, X } from "lucide-react";
import { DEMO_JOBS, type DemoJob, type JobCategory } from "../../../lib/demo-jobs";

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeCubic } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const CATEGORIES: JobCategory[] = ["Tech", "Design", "Marketing", "Product"];
const PER_PAGE = 8;

const CATEGORY_COLORS: Record<JobCategory, { pill: string }> = {
  Tech: { pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-transparent dark:bg-blue-500/20 dark:text-blue-300" },
  Design: { pill: "border-violet-200 bg-violet-50 text-violet-700 dark:border-transparent dark:bg-violet-500/20 dark:text-violet-300" },
  Marketing: { pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-transparent dark:bg-emerald-500/20 dark:text-emerald-300" },
  Product: { pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-transparent dark:bg-amber-500/20 dark:text-amber-300" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function JobCard({
  job,
  tc,
  selected,
  onClick,
}: {
  job: DemoJob;
  tc: ReturnType<typeof useTranslations>;
  selected: boolean;
  onClick: () => void;
}) {
  const accent = CATEGORY_COLORS[job.category];
  return (
    <motion.article
      variants={cardVariants}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
        selected
          ? "border-navy-primary bg-navy-primary/5 dark:border-navy-hover dark:bg-navy-hover/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
      }`}
    >
      {/* Top row: logo + title/company + salary */}
      <div className="flex items-start gap-3">
        {job.companyLogo && (
          <img
            src={job.companyLogo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 object-contain p-1 dark:border-slate-700 dark:bg-slate-700"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{job.title}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {job.company}
            {job.timezone && <span className="ml-1.5 text-slate-400 dark:text-slate-500">· {job.timezone}</span>}
          </p>
        </div>
        {job.salary && (
          <p className="shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {job.salary}<span className="text-xs font-normal text-slate-400">/yr</span>
          </p>
        )}
      </div>

      {/* Tags row */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent.pill}`}>
          {job.location === "Remote" ? tc("remote") : job.location}
        </span>
        {job.employmentType && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {job.employmentType}
          </span>
        )}
        {job.async && (
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300">
            {tc("asyncFriendly")}
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center gap-4">
        {job.datePosted && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock size={11} aria-hidden />
            {timeAgo(job.datePosted)}
          </span>
        )}
        {job.applicants !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Users size={11} aria-hidden />
            {job.applicants} applications
          </span>
        )}
        {job.urgent && (
          <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-500 dark:bg-red-500/10 dark:text-red-400">
            Urgent
          </span>
        )}
      </div>
    </motion.article>
  );
}

function JobDetailInner({ job, tc, onClose, showCloseOnDesktop }: { job: DemoJob; tc: ReturnType<typeof useTranslations>; onClose: () => void; showCloseOnDesktop?: boolean }) {
  const t = useTranslations("JobDetail");
  const locale = useLocale();
  const accent = CATEGORY_COLORS[job.category];
  const paragraphs = (text: string) => text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-100 p-5 dark:border-slate-700">
        <div className="flex items-start gap-3">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-contain p-1 dark:border-slate-700 dark:bg-slate-700"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{job.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{job.company}</p>
          </div>
          {showCloseOnDesktop && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={13} aria-hidden />{job.location}</span>
          {job.salary && <span className="flex items-center gap-1"><Banknote size={13} aria-hidden />{job.salary}/yr</span>}
          {job.datePosted && <span className="flex items-center gap-1"><CalendarDays size={13} aria-hidden />{new Date(job.datePosted).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent.pill}`}>{job.category}</span>
          {job.employmentType && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">{job.employmentType}</span>}
          {job.seniority && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">{job.seniority}</span>}
          {job.async && <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300">{tc("asyncFriendly")}</span>}
          {job.urgent && <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-500 dark:bg-red-500/10 dark:text-red-400">Urgent</span>}
        </div>

        {/* Apply buttons */}
        <div className="mt-4 flex gap-2">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
          >
            {t("applyNow")} <ExternalLink size={13} aria-hidden />
          </a>
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t("fullDetails")}
          </Link>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto space-y-6 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t("aboutRole")}</h3>
          <div className="space-y-3">{paragraphs(job.description).map((p, i) => <p key={i}>{p}</p>)}</div>
        </section>
        {job.requirements && (
          <section>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t("requirements")}</h3>
            <div className="space-y-3">{paragraphs(job.requirements).map((p, i) => <p key={i}>{p}</p>)}</div>
          </section>
        )}
        {job.benefits && (
          <section>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t("benefits")}</h3>
            <div className="space-y-3">{paragraphs(job.benefits).map((p, i) => <p key={i}>{p}</p>)}</div>
          </section>
        )}
      </div>
    </div>
  );
}

// Desktop panel
function JobDetailPanel({ job, tc, onClose }: { job: DemoJob; tc: ReturnType<typeof useTranslations>; onClose: () => void }) {
  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: easeCubic }}
      className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80"
    >
      <JobDetailInner job={job} tc={tc} onClose={onClose} showCloseOnDesktop />
    </motion.div>
  );
}

// Mobile bottom sheet
function MobileBottomSheet({ job, tc, onClose }: { job: DemoJob; tc: ReturnType<typeof useTranslations>; onClose: () => void }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl bg-white dark:bg-slate-900"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 40 }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="absolute right-4 top-3">
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <JobDetailInner job={job} tc={tc} onClose={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("JobsPage");
  const tc = useTranslations("Common");

  const query = searchParams.get("query") ?? "";
  const category = (searchParams.get("category") as JobCategory) ?? "";
  const location = searchParams.get("location") ?? "";
  const remoteOnly = searchParams.get("remote") === "true";
  const asyncOnly = searchParams.get("async") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [selectedJob, setSelectedJob] = useState<DemoJob | null>(null);

  const updateUrl = useCallback(
    (updates: { query?: string; category?: string; remote?: boolean; async?: boolean; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.query !== undefined) { if (updates.query) params.set("query", updates.query); else params.delete("query"); }
      if (updates.category !== undefined) { if (updates.category) params.set("category", updates.category); else params.delete("category"); }
      if (updates.remote !== undefined) { if (updates.remote) params.set("remote", "true"); else params.delete("remote"); }
      if (updates.async !== undefined) { if (updates.async) params.set("async", "true"); else params.delete("async"); }
      if (updates.page !== undefined) { if (updates.page > 1) params.set("page", String(updates.page)); else params.delete("page"); }
      const qs = params.toString();
      router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    let list = [...DEMO_JOBS];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
    if (category) list = list.filter((j) => j.category === category);
    if (location === "athens" || location === "thessaloniki") {
      list = list.filter((j) => j.timezone?.toLowerCase().includes("greece") || j.timezone?.toLowerCase().includes("eu"));
    } else if (location === "abroad") {
      list = list.filter((j) => !j.timezone?.toLowerCase().includes("greece"));
    }
    if (remoteOnly) list = list.filter((j) => j.location === "Remote");
    if (asyncOnly) list = list.filter((j) => j.async === true);
    return list;
  }, [query, category, location, remoteOnly, asyncOnly]);

  // Auto-select first job on desktop (lg+) when list changes
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    if (filtered.length > 0) {
      setSelectedJob((prev) => {
        const stillExists = prev && filtered.find((j) => j.id === prev.id);
        return stillExists ? prev : filtered[0];
      });
    } else {
      setSelectedJob(null);
    }
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE), [filtered, safePage]);

  const filtersRow = (
    <motion.div
      className="mb-4 flex flex-wrap items-center gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: easeCubic }}
    >
      <input
        type="search"
        placeholder={t("keywordPlaceholder")}
        value={query}
        onChange={(e) => updateUrl({ query: e.target.value, page: 1 })}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-navy-primary focus:outline-none focus:ring-2 focus:ring-navy-primary/20 sm:w-48 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-navy-hover dark:focus:ring-navy-hover/30"
      />
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-navy-primary has-[:checked]:bg-navy-primary/5 has-[:checked]:text-navy-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:has-[:checked]:border-navy-hover dark:has-[:checked]:bg-navy-hover/10 dark:has-[:checked]:text-navy-hover">
          <input type="checkbox" checked={remoteOnly} onChange={(e) => updateUrl({ remote: e.target.checked, page: 1 })} className="peer sr-only" />
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-slate-300 bg-white transition-all peer-checked:border-navy-primary peer-checked:bg-navy-primary peer-checked:[&_.check]:opacity-100 dark:border-slate-500 dark:bg-slate-700 dark:peer-checked:border-navy-hover dark:peer-checked:bg-navy-hover" aria-hidden>
            <span className="check absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
            </span>
          </span>
          <span className="pointer-events-none select-none">{t("remoteOnly")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-navy-primary has-[:checked]:bg-navy-primary/5 has-[:checked]:text-navy-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:has-[:checked]:border-navy-hover dark:has-[:checked]:bg-navy-hover/10 dark:has-[:checked]:text-navy-hover">
          <input type="checkbox" checked={asyncOnly} onChange={(e) => updateUrl({ async: e.target.checked, page: 1 })} className="peer sr-only" />
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-slate-300 bg-white transition-all peer-checked:border-navy-primary peer-checked:bg-navy-primary peer-checked:[&_.check]:opacity-100 dark:border-slate-500 dark:bg-slate-700 dark:peer-checked:border-navy-hover dark:peer-checked:bg-navy-hover" aria-hidden>
            <span className="check absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
            </span>
          </span>
          <span className="pointer-events-none select-none">{tc("asyncFriendly")}</span>
        </label>
      </div>
    </motion.div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      {/* Page header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeCubic }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
      </motion.header>

      {/* Category pill tabs */}
      <motion.div
        className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: easeCubic }}
      >
        {(["", ...CATEGORIES] as (JobCategory | "")[]).map((cat) => (
          <button
            key={cat || "all"}
            type="button"
            onClick={() => updateUrl({ category: cat, page: 1 })}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:border-slate-400 dark:hover:text-white"
            }`}
          >
            {cat || t("allCategories")}
          </button>
        ))}
      </motion.div>

      {/* Filters */}
      {filtersRow}

      {/* Results count */}
      {paginated.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }} className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-navy-primary dark:bg-navy-hover" aria-hidden />
          {t("openPositions", { count: filtered.length })}
        </motion.p>
      )}

      {/* Split layout */}
      <div className="flex gap-5">
        {/* Left: job list */}
        <div className="w-full lg:w-[420px] lg:shrink-0 xl:w-[460px]">
          <AnimatePresence mode="wait">
            {paginated.length === 0 ? (
              <motion.div key="empty" className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easeCubic }}>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{t("noResults")}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("noResultsHint")}</p>
              </motion.div>
            ) : (
              <motion.div key="list" className="grid gap-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                <AnimatePresence mode="popLayout">
                  {paginated.map((job) => (
                    <motion.div key={job.id} layout variants={cardVariants} exit="exit">
                      <JobCard
                        job={job}
                        tc={tc}
                        selected={selectedJob?.id === job.id}
                        onClick={() => setSelectedJob(job)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {paginated.length > 0 && filtered.length > PER_PAGE && (
            <motion.nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label={t("pagination")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}>
              <button type="button" onClick={() => updateUrl({ page: Math.max(1, safePage - 1) })} disabled={safePage <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                {t("previous")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} type="button" onClick={() => updateUrl({ page: p })} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${p === safePage ? "border-navy-primary bg-navy-primary text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}>
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => updateUrl({ page: Math.min(totalPages, safePage + 1) })} disabled={safePage >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                {t("next")}
              </button>
            </motion.nav>
          )}
        </div>

        {/* Right: detail panel — desktop only */}
        <div className="sticky top-[80px] hidden h-[calc(100vh-120px)] flex-1 lg:block">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <JobDetailPanel key={selectedJob.id} job={selectedJob} tc={tc} onClose={() => setSelectedJob(null)} />
            ) : (
              <motion.div
                key="empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700"
              >
                <p className="text-sm text-slate-400 dark:text-slate-500">Select a job to see details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {selectedJob && (
          <MobileBottomSheet key={selectedJob.id} job={selectedJob} tc={tc} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
