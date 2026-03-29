"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Globe, 
  Calendar, 
  Tag, 
  Mail, 
  LayoutDashboard,
  Zap,
  History
} from "lucide-react";
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
  const tAdmin = useTranslations("AdminDashboard");
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-4 text-sm font-bold">
        <Link
          href="/admin"
          className="text-foreground/30 hover:text-navy-primary transition-colors flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          {tAdmin("pageTitle")}
        </Link>
        <span className="text-foreground/10 text-xl font-light">/</span>
        <Link
          href="/admin/review"
          className="text-foreground/30 hover:text-navy-primary transition-colors"
        >
          {t("pageTitle")}
        </Link>
        <span className="text-foreground/10 text-xl font-light">/</span>
        <span className="text-navy-primary truncate max-w-[200px]">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card-background border border-foreground/5 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-2 text-navy-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <Zap className="w-4 h-4 fill-current" />
                Moderation Request
             </div>
             
             <h2 className="text-3xl font-black text-foreground tracking-tight mb-6">{job.title}</h2>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
                   <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Category
                   </p>
                   <p className="text-sm font-bold text-foreground">{job.category}</p>
                </div>
                <div className="p-4 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
                   <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Remote
                   </p>
                   <p className="text-sm font-bold text-foreground">{job.remoteType}</p>
                </div>
                <div className="p-4 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
                   <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Posted
                   </p>
                   <p className="text-sm font-bold text-foreground">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                   <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Salary
                   </p>
                   <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{job.salary || "Not specified"}</p>
                </div>
             </div>

             <div className="space-y-8">
                <div>
                   <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.15em] mb-4 border-b border-foreground/5 pb-2">Description</h3>
                   <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
                </div>

                {job.requirements && (
                  <div>
                    <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.15em] mb-4 border-b border-foreground/5 pb-2">Requirements</h3>
                    <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</div>
                  </div>
                )}

                {job.benefits && (
                  <div>
                    <h3 className="text-xs font-black text-foreground/30 uppercase tracking-[0.15em] mb-4 border-b border-foreground/5 pb-2">Benefits</h3>
                    <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">{job.benefits}</div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Moderation Column */}
        <div className="lg:col-span-4 space-y-6">
           <div className="sticky top-24 space-y-6">
              {/* Employer Widget */}
              <div className="p-6 rounded-[2rem] bg-card-background border border-foreground/5 shadow-sm">
                 <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-4">Origin</h4>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center overflow-hidden shrink-0">
                       {job.employer.logoUrl ? (
                         <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <Building2 className="w-5 h-5 text-foreground/20" />
                       )}
                    </div>
                    <div>
                       <p className="font-bold text-foreground leading-tight">{job.employer.companyName}</p>
                       <div className="flex items-center gap-2 mt-1">
                          {job.employer.website && (
                             <a href={job.employer.website} target="_blank" className="text-navy-primary hover:underline">
                                <Globe className="w-3 h-3" />
                             </a>
                          )}
                       </div>
                    </div>
                 </div>
                 <button className="w-full py-2.5 rounded-xl bg-foreground/5 text-foreground/60 text-[11px] font-bold uppercase tracking-wider hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Contact Employer
                 </button>
              </div>

              {/* Action Widget */}
              <div className="p-6 rounded-[2rem] bg-card-background border-2 border-navy-primary/10 shadow-xl shadow-navy-primary/5">
                 <h4 className="text-[10px] font-black text-navy-primary uppercase tracking-[0.2em] mb-4">Moderation Actions</h4>
                 
                 <div className="space-y-3">
                    {isPending && (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={approving || rejecting}
                          className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {approving ? t("approving") : t("approve")}
                        </button>
                        <button
                          onClick={() => setShowRejectForm(!showRejectForm)}
                          disabled={approving || rejecting}
                          className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          {t("reject")}
                        </button>
                      </>
                    )}

                    {isPublished && (
                      <button
                        onClick={handleUnpublish}
                        className="w-full py-4 rounded-2xl border-2 border-foreground/10 text-foreground font-black text-xs uppercase tracking-widest hover:bg-foreground/5 transition-all"
                      >
                        {t("unpublish")}
                      </button>
                    )}

                    {showRejectForm && (
                      <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest">
                          {t("rejectionReason")}
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={4}
                          placeholder={t("rejectionReasonPlaceholder")}
                          className="w-full px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none text-sm font-medium"
                        />
                        <button
                          onClick={handleReject}
                          disabled={rejecting}
                          className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                          CONFIRM REJECTION
                        </button>
                      </div>
                    )}
                 </div>

                 {error && (
                    <p className="mt-4 text-[11px] font-bold text-red-500 text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                 )}
                 {success && (
                    <p className="mt-4 text-[11px] font-bold text-emerald-500 text-center bg-emerald-500/10 py-2 rounded-lg">{success}</p>
                 )}
              </div>

              {/* Moderation History */}
              {job.moderationLogs.length > 0 && (
                <div className="p-6 rounded-[2rem] bg-card-background border border-foreground/5 shadow-sm">
                  <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <History className="w-3.5 h-3.5" /> History
                  </h4>
                  <div className="space-y-6">
                    {job.moderationLogs.map((log) => (
                      <div key={log.id} className="relative pl-5 border-l-2 border-foreground/5 py-1">
                        <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-4 border-card-background ${
                           log.action === "APPROVED" ? "bg-emerald-500" : "bg-red-500"
                        }`} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-foreground uppercase tracking-tight">
                            {t((LOG_KEYS[log.action] || log.action) as "logApproved")}
                          </span>
                          <span className="text-[10px] font-bold text-foreground/30">
                            By {log.admin.email}
                          </span>
                          {log.reason && (
                            <p className="text-[11px] text-foreground/50 font-medium italic mt-1.5 leading-relaxed bg-foreground/[0.03] p-2 rounded-lg border border-foreground/5">
                                "{log.reason}"
                            </p>
                          )}
                          <span className="text-[9px] font-black text-foreground/20 mt-1 uppercase">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

