"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Star, Users, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type DbStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
type UIStatus = "new" | "reviewed" | "shortlisted" | "rejected";
type FilterKey = "all" | UIStatus;

export type RealApplication = {
  id: string;
  status: DbStatus;
  createdAt: string;
  coverLetter: string | null;
  cvPath: string | null;
  candidate: { fullName: string; email: string };
  job: { title: string };
};

const DB_TO_UI: Record<DbStatus, UIStatus> = {
  PENDING: "new",
  REVIEWING: "reviewed",
  ACCEPTED: "shortlisted",
  REJECTED: "rejected",
};

const UI_TO_DB: Record<UIStatus, DbStatus> = {
  new: "PENDING",
  reviewed: "REVIEWING",
  shortlisted: "ACCEPTED",
  rejected: "REJECTED",
};

const STATUS_BADGE: Record<UIStatus, { className: string }> = {
  new: { className: "bg-blue-500/10 text-blue-500" },
  reviewed: { className: "bg-amber-500/10 text-amber-500" },
  shortlisted: { className: "bg-emerald-500/10 text-emerald-500" },
  rejected: { className: "bg-red-500/10 text-red-400" },
};

const FILTERS: { key: FilterKey }[] = [
  { key: "all" },
  { key: "new" },
  { key: "reviewed" },
  { key: "shortlisted" },
];

type AppWithUI = RealApplication & { uiStatus: UIStatus };

/* ─── CV Preview Modal ─── */
function CvPreviewModal({
  app,
  onClose,
}: {
  app: AppWithUI;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard");
  const [loadingCv, setLoadingCv] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleViewCv() {
    setLoadingCv(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/cv`);
      if (!res.ok) { alert("Failed to load CV"); return; }
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      alert("Failed to load CV");
    } finally {
      setLoadingCv(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-primary/20 backdrop-blur-md transition-opacity" />
      <div
        className="relative w-full max-w-md rounded-[24px] bg-white dark:bg-[#0f111a] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-primary flex items-center justify-center">
              <span className="text-sm font-black text-white uppercase">
                {app.candidate.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{app.candidate.fullName}</h3>
              <p className="text-xs text-foreground/40">{app.candidate.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">{t("appliedFor")}</p>
            <p className="text-sm font-semibold text-foreground">{app.job.title}</p>
          </div>

          {app.coverLetter && (
            <div>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-1">{t("coverLetter")}</p>
              <p className="text-sm text-foreground/70 leading-relaxed line-clamp-4">{app.coverLetter}</p>
            </div>
          )}

          {app.cvPath ? (
            <button
              onClick={handleViewCv}
              disabled={loadingCv}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60"
            >
              {loadingCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {t("downloadCV")}
            </button>
          ) : (
            <div className="px-4 py-3 rounded-xl bg-foreground/5 text-center">
              <p className="text-sm text-foreground/40">{t("noCVAttached")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LatestApplications({
  initialApplications,
}: {
  initialApplications: RealApplication[];
}) {
  const t = useTranslations("Dashboard");

  const [apps, setApps] = useState<AppWithUI[]>(() =>
    initialApplications.map((a) => ({ ...a, uiStatus: DB_TO_UI[a.status] }))
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [viewingApp, setViewingApp] = useState<AppWithUI | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const perPage = 4;

  useEffect(() => { setPage(1); }, [filter]);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.uiStatus === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const newCount = apps.filter((a) => a.uiStatus === "new").length;

  async function updateStatus(id: string, uiStatus: UIStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: UI_TO_DB[uiStatus] }),
      });
      if (res.ok) {
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, uiStatus, status: UI_TO_DB[uiStatus] } : a)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const closeModal = useCallback(() => setViewingApp(null), []);

  if (apps.length === 0) {
    return (
      <div className="rounded-3xl bg-card-background border border-foreground/10 px-5 py-10 text-center shadow-sm">
        <Users className="w-8 h-8 text-foreground/15 mx-auto mb-2" />
        <p className="text-foreground/50 text-sm">{t("noApplications")}</p>
        <p className="text-foreground/30 text-xs mt-1 px-4">{t("appsDescription")}</p>
      </div>
    );
  }

  return (
    <>
      {viewingApp && <CvPreviewModal app={viewingApp} onClose={closeModal} />}

      <div className="sticky top-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold text-foreground">{t("applications")}</h3>
          {newCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
              {newCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? apps.length : apps.filter((a) => a.uiStatus === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? "bg-navy-primary text-white"
                    : "bg-section-muted text-foreground/50 hover:text-foreground"
                }`}
              >
                {t(`filters.${f.key}`)}
                <span className={`ml-1 text-[10px] ${filter === f.key ? "text-white/60" : "text-foreground/30"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications list */}
        <div className="space-y-3">
          {paged.length === 0 ? (
            <div className="rounded-3xl bg-card-background border border-foreground/10 px-5 py-10 text-center shadow-sm">
              <Users className="w-8 h-8 text-foreground/15 mx-auto mb-2" />
              <p className="text-foreground/50 text-sm">
                {t("noFilteredApplications", { status: t(`filters.${filter}`).toLowerCase() })}
              </p>
            </div>
          ) : (
            paged.map((app) => (
              <div
                key={app.id}
                className="group relative rounded-3xl bg-card-background border border-foreground/10 p-4 hover:border-navy-primary/30 hover:shadow-lg hover:shadow-navy-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-primary/10 to-navy-primary/5 border border-foreground/5 flex items-center justify-center">
                      <span className="text-sm font-black text-navy-primary uppercase">
                        {app.candidate.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    {app.uiStatus === "new" && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 shadow-sm animate-pulse" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-foreground text-[15px] truncate group-hover:text-navy-primary transition-colors">
                        {app.candidate.fullName}
                      </h4>
                      <span className="text-[10px] font-bold text-foreground/20 whitespace-nowrap uppercase tracking-tighter">
                        {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-navy-primary truncate mt-0.5">{app.candidate.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${STATUS_BADGE[app.uiStatus].className}`}>
                        {t(`status.${app.uiStatus}`)}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-medium truncate italic max-w-[120px]">
                        for {app.job.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingApp(app)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all bg-navy-primary/5 text-navy-primary hover:bg-navy-primary hover:text-white"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t("actions.viewCV")}
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "shortlisted")}
                      disabled={updatingId === app.id}
                      className={`p-1.5 rounded-xl transition-all ${
                        app.uiStatus === "shortlisted"
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-foreground/5 text-foreground/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                      }`}
                      title="Shortlist"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {app.uiStatus === "new" && (
                      <button
                        onClick={() => updateStatus(app.id, "reviewed")}
                        disabled={updatingId === app.id}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-blue-500/10 hover:text-blue-500 transition-all font-bold text-[11px] px-3"
                      >
                        {t("actions.markReviewed")}
                      </button>
                    )}
                    {app.uiStatus !== "rejected" ? (
                      <button
                        onClick={() => updateStatus(app.id, "rejected")}
                        disabled={updatingId === app.id}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title={t("actions.reject")}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(app.id, "new")}
                        disabled={updatingId === app.id}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-blue-500/10 hover:text-blue-500 transition-all text-[11px] font-bold px-3"
                      >
                        {t("actions.restore")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-foreground/30">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded-md text-[11px] font-medium transition-colors ${
                    page === p
                      ? "bg-navy-primary text-white"
                      : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
