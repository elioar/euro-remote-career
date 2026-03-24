"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ModerationLog = {
  id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  admin: { email: string };
};

type Employer = {
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
};

type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  category: string;
  remoteType: string;
  asyncLevel: string | null;
  timezone: string | null;
  salary: string | null;
  location: string | null;
  tags: string[];
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  employer: Employer;
  moderationLogs: ModerationLog[];
};

const LOG_KEYS: Record<string, string> = {
  APPROVED: "logApproved",
  REJECTED: "logRejected",
  EDITED: "logEdited",
  UNPUBLISHED: "logUnpublished",
};

export default function AdminJobReview({ job }: { job: Job }) {
  const t = useTranslations("AdminReview");
  const router = useRouter();

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleApprove() {
    setError("");
    setSuccess("");
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }
      setSuccess(t("successApproved"));
      setTimeout(() => router.push("/admin/review"), 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError(t("errorReasonRequired"));
      return;
    }
    setError("");
    setSuccess("");
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: reason.trim() }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }
      setSuccess(t("successRejected"));
      setTimeout(() => router.push("/admin/review"), 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setRejecting(false);
    }
  }

  async function handleUnpublish() {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }
      setSuccess(t("successUnpublished"));
      setTimeout(() => router.push("/admin/jobs"), 1500);
    } catch {
      setError(t("errorGeneric"));
    }
  }

  const isPending = job.status === "PENDING_REVIEW";
  const isPublished = job.status === "PUBLISHED";

  return (
    <div>
      <Link
        href="/admin/review"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToReview")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job preview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-foreground">{job.title}</h2>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2.5 py-1 rounded-md bg-section-muted text-foreground/70">{job.category}</span>
            <span className="px-2.5 py-1 rounded-md bg-section-muted text-foreground/70">{job.remoteType}</span>
            {job.asyncLevel && (
              <span className="px-2.5 py-1 rounded-md bg-section-muted text-foreground/70">{job.asyncLevel}</span>
            )}
            {job.timezone && (
              <span className="px-2.5 py-1 rounded-md bg-section-muted text-foreground/70">{job.timezone}</span>
            )}
            {job.salary && (
              <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{job.salary}</span>
            )}
          </div>

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-navy-primary/10 text-navy-primary text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl bg-section-muted border border-foreground/10 space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">{t("aboutRole")}</h3>
              <div className="text-foreground/70 text-sm whitespace-pre-line">{job.description}</div>
            </div>

            {job.requirements && (
              <div>
                <h3 className="font-medium text-foreground mb-2">{t("requirements")}</h3>
                <div className="text-foreground/70 text-sm whitespace-pre-line">{job.requirements}</div>
              </div>
            )}

            {job.benefits && (
              <div>
                <h3 className="font-medium text-foreground mb-2">{t("benefits")}</h3>
                <div className="text-foreground/70 text-sm whitespace-pre-line">{job.benefits}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">{error}</p>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {isPending && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={approving || rejecting}
                className="flex-1 py-3 px-6 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {approving ? t("approving") : t("approve")}
              </button>
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={approving || rejecting}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {t("reject")}
              </button>
            </div>
          )}

          {isPublished && (
            <button
              onClick={handleUnpublish}
              className="py-3 px-6 rounded-xl border border-foreground/20 text-foreground font-semibold hover:bg-section-muted transition-colors"
            >
              {t("unpublish")}
            </button>
          )}

          {showRejectForm && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                {t("rejectionReason")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t("rejectionReasonPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="py-2.5 px-5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                {rejecting ? t("rejecting") : t("reject")}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Employer info */}
          <div className="p-4 rounded-2xl border border-foreground/10 bg-section-muted">
            <h3 className="font-medium text-foreground mb-3">{t("employerInfo")}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-foreground/50">{t("company")}:</span>{" "}
                <span className="text-foreground font-medium">{job.employer.companyName}</span>
              </div>
              {job.employer.website && (
                <div>
                  <span className="text-foreground/50">{t("website")}:</span>{" "}
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-primary hover:underline"
                  >
                    {job.employer.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Moderation log */}
          {job.moderationLogs.length > 0 && (
            <div className="p-4 rounded-2xl border border-foreground/10 bg-section-muted">
              <h3 className="font-medium text-foreground mb-3">{t("moderationLog")}</h3>
              <div className="space-y-2">
                {job.moderationLogs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {t((LOG_KEYS[log.action] || log.action) as "logApproved")}
                      </span>
                      <span className="text-foreground/40 text-xs">
                        {t("by")} {log.admin.email}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-foreground/50 text-xs mt-0.5">{log.reason}</p>
                    )}
                    <p className="text-foreground/30 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
