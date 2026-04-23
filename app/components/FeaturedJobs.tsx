"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { DEMO_JOBS, type DemoJob } from "@/lib/demo-jobs";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RoleBlockModal } from "./RoleBlockModal";

const FEATURED_JOBS = DEMO_JOBS.slice(0, 6);

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: easeCubic },
  }),
};

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  Design: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
  Marketing: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  Product: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  const days = Math.floor(diff / 1440);
  return days === 1 ? "1d ago" : `${days}d ago`;
}

function JobCard({ job, index, tc, t, isLoggedIn, isEmployer }: { job: DemoJob; index: number; tc: ReturnType<typeof useTranslations>; t: ReturnType<typeof useTranslations>; isLoggedIn: boolean | null; isEmployer: boolean }) {
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const applyHref = isLoggedIn === false
    ? `/login?callbackUrl=/jobs/${job.slug}`
    : `/jobs/${job.slug}`;
  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="group relative flex flex-col rounded-2xl border border-border-card bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-border-muted dark:bg-card-background hover:dark:bg-card-active hover:dark:border-white/20"
    >
      {job.urgent && (
        <span className="absolute right-4 top-4 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500 dark:bg-red-500/10 dark:text-red-400">
          {t("urgent")}
        </span>
      )}

      {/* Logo + company + title */}
      <div className="flex items-start gap-3">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl border border-border-card object-contain p-1 dark:border-border-muted dark:bg-card-active"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-card bg-slate-50 text-sm font-bold text-slate-400 dark:border-border-muted dark:bg-card-active dark:text-foreground/30">
            {job.company[0]}
          </div>
        )}
        <div className="min-w-0 flex-1 pr-8">
          <p className="truncate text-xs font-medium text-slate-500 dark:text-foreground/50">{job.company}</p>
          <h3 className="mt-0.5 truncate font-semibold leading-snug text-slate-900 dark:text-foreground">
            <Link href={`/jobs/${job.slug}`} className="hover:text-navy-primary dark:hover:text-navy-hover">
              {job.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          {tc("remote")}
        </span>
        {job.employmentType && (
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground/60">
            {job.employmentType}
          </span>
        )}
        {job.async && (
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-300">
            {tc("asyncFriendly")}
          </span>
        )}
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[job.category] ?? ""}`}>
          {job.category}
        </span>
      </div>

      {/* Salary + timezone */}
      <div className="mt-3 flex items-center gap-3 text-sm">
        {job.salary && (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {job.salary}
            <span className="text-xs font-normal text-slate-400 dark:text-foreground/40">{t("perYear")}</span>
          </span>
        )}
        {job.timezone && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-foreground/40">
            <MapPin size={10} aria-hidden />
            {job.timezone}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-foreground/60">
        {job.description.split("\n")[0]}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-3 text-xs text-slate-400 dark:text-foreground/40">
          {job.datePosted && (
            <span className="flex items-center gap-1">
              <Clock size={11} aria-hidden />
              {timeAgo(job.datePosted)}
            </span>
          )}
          {job.applicants !== undefined && (
            <span className="flex items-center gap-1">
              <Users size={11} aria-hidden />
              {job.applicants}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/jobs/${job.slug}`}
            className="rounded-lg border border-border-card px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-border-muted dark:text-foreground/60 dark:hover:bg-card-active"
          >
            {tc("viewMore")}
          </Link>
          {isEmployer ? (
            <>
              <button
                type="button"
                onClick={() => setShowEmployerModal(true)}
                className="rounded-lg bg-navy-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-hover"
              >
                {tc("apply")}
              </button>
              <RoleBlockModal open={showEmployerModal} onClose={() => setShowEmployerModal(false)} variant="employerCannotApply" />
            </>
          ) : (
            <Link
              href={applyHref}
              className="rounded-lg bg-navy-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-hover"
            >
              {tc("apply")}
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function FeaturedJobs({ jobs = FEATURED_JOBS }: { jobs?: DemoJob[] }) {
  const t = useTranslations("FeaturedJobs");
  const tc = useTranslations("Common");
  const [browseHref, setBrowseHref] = useState<"/jobs" | "/dashboard">("/jobs");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) return;
      const role = (user.user_metadata?.role as string) ?? "CANDIDATE";
      if (role === "EMPLOYER") {
        setIsEmployer(true);
      } else {
        setBrowseHref("/dashboard");
      }
    });
  }, []);

  return (
    <section className="border-b border-border-muted bg-section-muted py-12 sm:py-16 lg:py-20 dark:border-border-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: easeCubic }}
          >
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-foreground/50">
              {t("subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Link
              href={browseHref}
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border-muted bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:bg-card-background dark:text-foreground/70 dark:hover:bg-card-active sm:inline-flex"
            >
              {t("viewMoreJobs")}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} tc={tc} t={t} isLoggedIn={isLoggedIn} isEmployer={isEmployer} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={browseHref}
            className="inline-flex items-center gap-2 rounded-full bg-navy-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
          >
            {t("viewMoreJobs")}
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
