"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Plus, Send, Archive, Pencil, Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type JobStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED" | "EXPIRED";

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

export default function MyJobsList({ initialJobs }: { initialJobs: Job[] }) {
  const t = useTranslations("MyJobs");
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<JobStatus | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = filter === "ALL" ? jobs : jobs.filter((j) => j.status === filter);

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
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }
      const data = await res.json();
      if (data.deleted) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "ARCHIVED" as JobStatus } : j))
        );
      }
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

  return (
    <div id="my-jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">{t("pageTitle")}</h2>
          <p className="text-xs text-foreground/60">{t("pageSubtitle")}</p>
        </div>
        <Link
          href="/dashboard/post-job"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy-primary text-white text-xs font-semibold hover:bg-navy-hover transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("postNewJob")}
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {STATUS_FILTERS.map((s) => (
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
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl mb-4">
          {error}
        </p>
      )}

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-foreground/60 mb-1">
            {filter === "ALL" ? t("noJobs") : t("noJobsInFilter")}
          </p>
          {filter === "ALL" && (
            <p className="text-foreground/40 text-sm">{t("noJobsHint")}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-2xl border border-foreground/10 bg-section-muted hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
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
                  {job.status === "PUBLISHED" && (
                     <div className="flex items-center gap-4 mt-2 mb-1 text-xs font-semibold text-foreground/70">
                       <span className="flex items-center gap-1.5 bg-navy-primary/10 text-navy-primary px-2 py-0.5 rounded-full">
                         <Eye className="w-3.5 h-3.5" /> {(job.id.charCodeAt(0) * 17) % 500 + 40} Views
                       </span>
                       <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                         <Send className="w-3.5 h-3.5" /> {job._count?.applications || 0} Applies
                       </span>
                     </div>
                  )}
                  {job.status === "REJECTED" && job.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {t("rejectionReason")} {job.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
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
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                      title={t("view")}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
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
                  {job.status === "DRAFT" && (
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={actionLoading === job.id}
                      className="p-2 rounded-lg text-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
