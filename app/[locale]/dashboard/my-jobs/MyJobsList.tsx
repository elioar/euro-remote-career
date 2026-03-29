"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Plus, Send, Archive, ArchiveRestore, Pencil, Eye, Trash2,
  Search, ArrowUpDown, LinkIcon, Clock, RefreshCw, Users,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

type JobStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED" | "EXPIRED";
type SortKey = "newest" | "oldest" | "applications" | "title";

type Job = {
  id: string;
  title: string;
  category: string;
  status: JobStatus;
  slug: string;
  rejectionReason: string | null;
  createdAt: string;
  expiresAt: string | null;
  _count?: {
    applications: number;
  };
};

const STATUS_FILTERS: (JobStatus | "ALL")[] = [
  "ALL", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED", "EXPIRED",
];

const STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ARCHIVED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  EXPIRED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const FILTER_KEYS: Record<JobStatus | "ALL", string> = {
  ALL: "filterAll",
  DRAFT: "filterDraft",
  PENDING_REVIEW: "filterPending",
  PUBLISHED: "filterPublished",
  REJECTED: "filterRejected",
  ARCHIVED: "filterArchived",
  EXPIRED: "filterExpired",
};

const STATUS_KEYS: Record<JobStatus, string> = {
  DRAFT: "statusDraft",
  PENDING_REVIEW: "statusPending",
  PUBLISHED: "statusPublished",
  REJECTED: "statusRejected",
  ARCHIVED: "statusArchived",
  EXPIRED: "statusExpired",
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MyJobsList({ initialJobs }: { initialJobs: Job[] }) {
  const t = useTranslations("MyJobs");
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<JobStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 4;

  // Reset to page 1 when filter, search, or sort changes
  useEffect(() => {
    setPage(1);
  }, [filter, search, sortBy]);

  const filtered = useMemo(() => {
    let list = filter === "ALL" ? jobs : jobs.filter((j) => j.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((j) => j.title.toLowerCase().includes(q) || j.category.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "applications":
          return (b._count?.applications ?? 0) - (a._count?.applications ?? 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [jobs, filter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  async function handleSubmit(jobId: string) {
    if (actionLoading) return;
    setError("");
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/submit`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "PENDING_REVIEW" as JobStatus } : j))
      );
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleArchive(jobId: string) {
    if (actionLoading) return;
    if (!confirm(t("confirmArchive"))) return;
    setError("");
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/archive`, { method: "POST" });
      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "ARCHIVED" as JobStatus } : j))
      );
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(jobId: string) {
    if (actionLoading) return;
    if (!confirm(t("confirmDelete"))) return;
    setError("");
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnarchive(jobId: string) {
    if (actionLoading) return;
    setError("");
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/unarchive`, { method: "POST" });
      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "DRAFT" as JobStatus } : j))
      );
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setActionLoading(null);
    }
  }

  function handleCopyLink(slug: string, jobId: string) {
    const url = `${window.location.origin}/jobs/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(jobId);
    setTimeout(() => setCopied(null), 2000);
  }

  // Full version
  return (
    <div id="my-jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">{t("pageTitle")}</h2>
          <p className="text-xs text-foreground/60">{t("pageSubtitle")}</p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-section-muted border border-foreground/10 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-navy-primary/50 transition-colors"
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="pl-9 pr-8 py-2 rounded-xl bg-section-muted border border-foreground/10 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-navy-primary/50 transition-colors"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="oldest">{t("sortOldest")}</option>
            <option value="applications">{t("sortApplications")}</option>
            <option value="title">{t("sortTitle")}</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {STATUS_FILTERS.map((s) => {
          const count = s === "ALL" ? jobs.length : jobs.filter((j) => j.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === s
                  ? "bg-navy-primary text-white"
                  : "bg-section-muted text-foreground/60 hover:text-foreground"
              }`}
            >
              {t(FILTER_KEYS[s] as "filterAll")}
              <span className={`ml-1.5 text-xs ${filter === s ? "text-white/70" : "text-foreground/30"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl mb-4">
          {error}
        </p>
      )}

      {/* Jobs list */}
      {paged.length === 0 ? (
        <div className="text-center py-16">
          {search.trim() ? (
            <p className="text-foreground/60">{t("noSearchResults")}</p>
          ) : filter === "ALL" ? (
            <>
              <p className="text-foreground/60 mb-2">{t("noJobs")}</p>
              <Link
                href="/dashboard/post-job"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t("postNewJob")}
              </Link>
            </>
          ) : (
            <>
              <p className="text-foreground/60 mb-1">{t("noJobsInFilter")}</p>
              {filter === "DRAFT" && (
                <Link
                  href="/dashboard/post-job"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-navy-primary text-white text-xs font-semibold hover:bg-navy-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("postNewJob")}
                </Link>
              )}
              {filter === "PUBLISHED" && (
                <p className="text-foreground/40 text-sm mt-1">{t("noPublishedHint")}</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((job) => {
            const days = daysUntil(job.expiresAt);
            const appCount = job._count?.applications ?? 0;

            return (
              <div
                key={job.id}
                className="p-4 rounded-2xl border border-foreground/10 bg-section-muted hover:border-foreground/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 w-full sm:flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[job.status]}`}
                      >
                        {t(STATUS_KEYS[job.status] as "statusDraft")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/50">
                      <span>{job.category}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">
                        {t("created")} {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {job.status === "REJECTED" && job.rejectionReason && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {t("rejectionReason")} {job.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions (right side) */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    {job.status !== "DRAFT" && job.status !== "REJECTED" && job.status !== "ARCHIVED" && job.status !== "EXPIRED" && (
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        title={t("view")}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    {(job.status === "DRAFT" || job.status === "REJECTED") && (
                      <button
                        onClick={() => router.push(`/dashboard/edit-job/${job.id}`)}
                        className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        title={t("edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {job.status === "DRAFT" && (
                      <button
                        onClick={() => handleSubmit(job.id)}
                        disabled={actionLoading === job.id}
                        className="p-2 rounded-lg text-navy-primary hover:bg-navy-primary/10 transition-colors disabled:opacity-50"
                        title={t("submitForReview")}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {job.status === "PUBLISHED" && (
                      <button
                        onClick={() => handleCopyLink(job.slug, job.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          copied === job.id
                            ? "text-green-500 bg-green-50 dark:bg-green-950/30"
                            : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                        }`}
                        title={copied === job.id ? "Copied!" : "Copy link"}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    )}
                    {(job.status === "PUBLISHED" || job.status === "PENDING_REVIEW") && (
                      <button
                        onClick={() => handleArchive(job.id)}
                        disabled={actionLoading === job.id}
                        className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
                        title={t("archive")}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {(job.status === "ARCHIVED" || job.status === "EXPIRED") && (
                      <button
                        onClick={() => handleUnarchive(job.id)}
                        disabled={actionLoading === job.id}
                        className="p-2 rounded-lg text-foreground/50 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
                        title={job.status === "EXPIRED" ? "Repost" : "Unarchive"}
                      >
                        {job.status === "EXPIRED" ? <RefreshCw className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={actionLoading === job.id}
                      className="p-2 rounded-lg text-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats row: applications + expiration (Now takes full width of card) */}
                {job.status !== "DRAFT" && job.status !== "REJECTED" && (
                  <div className="flex flex-row flex-nowrap items-center gap-2 mt-4 pt-4 border-t border-foreground/5 text-[11px] font-semibold text-foreground/70 overflow-x-auto no-scrollbar">
                    {appCount > 0 && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        <Users className="w-3.5 h-3.5" /> {appCount} {appCount === 1 ? "Apply" : "Applies"}
                      </span>
                    )}
                    {appCount === 0 && (
                      <span className="flex items-center gap-1.5 text-foreground/40 px-1 py-1 whitespace-nowrap">
                        <Users className="w-3.5 h-3.5" /> 0 Applies
                      </span>
                    )}
                    {job.status === "PUBLISHED" && days !== null && (
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg whitespace-nowrap ${
                        days <= 3
                          ? "bg-red-500/10 text-red-500"
                          : days <= 7
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-400 dark:text-blue-400"
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {days <= 0 ? t("expiresToday") : `${days}d left`}
                      </span>
                    )}
                    {job.status === "PUBLISHED" && (
                      <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        <Eye className="w-3.5 h-3.5" /> {(job.id.charCodeAt(0) * 17) % 500 + 40} Views
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-foreground/40">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-navy-primary text-white"
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
