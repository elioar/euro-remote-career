"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Briefcase, ExternalLink, Clock } from "lucide-react";

type ApplicationStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";

type MyApplication = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  coverLetter: string | null;
  job: {
    id: string;
    title: string;
    slug: string;
    employer: {
      companyName: string;
      logoUrl: string | null;
    };
  };
};

const STATUS_STYLES: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: "Applied", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  REVIEWING: { label: "Under Review", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ACCEPTED: { label: "Accepted", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  REJECTED: { label: "Declined", className: "bg-red-500/10 text-red-500 dark:text-red-400" },
};

function timeAgo(dateStr: string, locale: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale === "el" ? "el" : "en", { numeric: "auto", style: "short" });
  if (diff < 60) return rtf.format(-diff, "minute");
  if (diff < 1440) return rtf.format(-Math.floor(diff / 60), "hour");
  if (diff < 43200) return rtf.format(-Math.floor(diff / 1440), "day");
  return new Date(dateStr).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function MyApplications({ applications }: { applications: MyApplication[] }) {
  const td = useTranslations("DashboardCandidate");
  const locale = useLocale();

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-navy-primary/5 border border-navy-primary/10 flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7 text-navy-primary/40" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{td("noApplications")}</h3>
        <p className="text-sm text-foreground/50 mb-6 max-w-xs">{td("noApplicationsDesc")}</p>
        <Link
          href="/jobs"
          className="px-5 py-2.5 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors"
        >
          {td("browseJobs")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {applications.map((app) => {
        const { label, className } = STATUS_STYLES[app.status];
        return (
          <div
            key={app.id}
            className="group rounded-2xl border border-foreground/10 bg-card-background p-4 hover:border-navy-primary/25 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              {app.job.employer.logoUrl ? (
                <img
                  src={app.job.employer.logoUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-xl border border-border-card object-contain p-1 bg-white dark:bg-card-active dark:border-border-muted"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-xl bg-navy-primary/10 border border-navy-primary/15 flex items-center justify-center">
                  <span className="text-xs font-black text-navy-primary uppercase">
                    {app.job.employer.companyName.slice(0, 2)}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-[15px] truncate group-hover:text-navy-primary transition-colors">
                      {app.job.title}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">{app.job.employer.companyName}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide ${className}`}>
                    {label}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-[11px] text-foreground/35 font-medium">
                    <Clock className="w-3 h-3" />
                    {timeAgo(app.createdAt, locale)}
                  </span>
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-navy-primary hover:text-navy-hover transition-colors"
                  >
                    {td("viewJob")}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
