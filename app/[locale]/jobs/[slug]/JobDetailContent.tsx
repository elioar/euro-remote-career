"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Banknote, CalendarDays, CheckCircle, LogIn } from "lucide-react";
import { useState } from "react";
import type { DemoJob } from "../../../../lib/demo-jobs";
import type { CandidateApplyData } from "./page";
import { ApplyModal } from "./ApplyModal";
import { RoleBlockModal } from "@/app/components/RoleBlockModal";

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeCubic } },
};

function ApplyCard({
  job,
  candidateApplyData,
  isLoggedIn,
  isEmployer,
}: {
  job: DemoJob;
  candidateApplyData: CandidateApplyData;
  isLoggedIn: boolean;
  isEmployer: boolean;
}) {
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const loginHref = `/login?callbackUrl=/jobs/${job.slug}`;
  const t = useTranslations("JobDetail");
  const ta = useTranslations("Apply");
  const [showModal, setShowModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(candidateApplyData?.hasApplied ?? false);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: easeCubic }}
      className="w-full shrink-0 rounded-2xl border border-border-card bg-white p-5 shadow-sm lg:sticky lg:top-[90px] lg:w-80 lg:self-start dark:border-border-card dark:bg-card-background"
      aria-label={job.isInternalJob ? ta("title") : t("applyOnCompanySite")}
    >
      {job.companyLogo ? (
        <div className="mb-3 flex justify-center">
          <img
            src={job.companyLogo}
            alt=""
            className="h-10 w-10 rounded-full border border-slate-100 bg-white object-contain dark:border-border-muted dark:bg-card-active"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      ) : null}

      {job.isInternalJob ? (
        <>
          <h2 className="text-base font-semibold text-foreground">{ta("title")}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-foreground/70">{ta("intro")}</p>

          <div className="mt-4">
            {isEmployer ? (
              <>
                <motion.button
                  onClick={() => setShowEmployerModal(true)}
                  className="w-full flex items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {ta("submit")} →
                </motion.button>
                <RoleBlockModal open={showEmployerModal} onClose={() => setShowEmployerModal(false)} variant="employerCannotApply" />
              </>
            ) : hasApplied ? (
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {ta("alreadyApplied")}
              </div>
            ) : candidateApplyData ? (
              <motion.button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {ta("submit")} →
              </motion.button>
            ) : (
              <Link
                href={loginHref}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
              >
                <LogIn className="w-4 h-4" />
                {ta("loginRequired")}
              </Link>
            )}
          </div>

          {showModal && candidateApplyData && (
            <ApplyModal
              jobId={job.jobDbId!}
              jobTitle={job.title}
              company={job.company}
              candidateName={candidateApplyData.fullName}
              candidateEmail={candidateApplyData.email}
              cvs={candidateApplyData.cvs}
              onClose={() => setShowModal(false)}
              onSuccess={() => setHasApplied(true)}
            />
          )}
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold text-foreground dark:text-foreground">
            {t("applyOnCompanySite")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-foreground/70">
            {t("applyRedirectText")}
          </p>
          {isEmployer ? (
            <>
              <motion.button
                onClick={() => setShowEmployerModal(true)}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("applyNow")}
              </motion.button>
              <RoleBlockModal open={showEmployerModal} onClose={() => setShowEmployerModal(false)} variant="employerCannotApply" />
            </>
          ) : isLoggedIn ? (
            <motion.a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("applyNow")}
            </motion.a>
          ) : (
            <Link
              href={loginHref}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
            >
              <LogIn className="w-4 h-4" />
              {ta("loginRequired")}
            </Link>
          )}
        </>
      )}

      <Link
        href="/jobs"
        className="mt-3 flex w-full items-center justify-center rounded-lg border border-border-card px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-muted dark:text-foreground/80 dark:hover:bg-card-active"
      >
        {t("backToJobs")}
      </Link>
      <dl className="mt-5 space-y-2 border-t border-border-muted pt-4 text-sm dark:border-border-muted">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500 dark:text-foreground/50">{t("company")}</dt>
          <dd className="font-medium text-slate-800 dark:text-foreground/80">{job.company}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500 dark:text-slate-400">{t("category")}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-200">{job.category}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500 dark:text-slate-400">{t("remote")}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-200">{job.location}</dd>
        </div>
        {job.async && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">{t("asyncFriendly")}</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">{t("yesCheck")}</dd>
          </div>
        )}
        {job.salary && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500 dark:text-slate-400">{t("salary")}</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">{job.salary}</dd>
          </div>
        )}
      </dl>
    </motion.aside>
  );
}

function DescriptionBlock({ title, content, delay = 0 }: { title: string; content: string; delay?: number }) {
  const paragraphs = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return (
    <motion.section
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: easeCubic }}
    >
      <h2 className="text-lg font-semibold text-foreground dark:text-foreground">{title}</h2>
      <div className="mt-3 max-w-prose space-y-4 text-slate-700 leading-relaxed dark:text-foreground/85">
        {paragraphs.map((p, i) => {
          if (p.startsWith("- ") || p.startsWith("* ")) {
            const items = p.split(/\n/).map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );
          }
          return <p key={i}>{p}</p>;
        })}
      </div>
    </motion.section>
  );
}

type JobDetailContentProps = {
  job: DemoJob;
  candidateApplyData: CandidateApplyData;
  isLoggedIn: boolean;
  isEmployer: boolean;
};

export function JobDetailContent({ job, candidateApplyData, isLoggedIn, isEmployer }: JobDetailContentProps) {
  const t = useTranslations("JobDetail");
  const locale = useLocale();

  return (
    <>
      <motion.nav
        aria-label={t("breadcrumb")}
        className="text-sm text-slate-600 dark:text-foreground/60"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeCubic }}
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li><Link href="/" className="text-navy-primary hover:text-navy-hover dark:text-navy-accent dark:hover:text-navy-accent/80">{t("home")}</Link></li>
          <li aria-hidden="true" className="text-slate-400 dark:text-foreground/30">/</li>
          <li><Link href="/jobs" className="text-navy-primary hover:text-navy-hover dark:text-navy-accent dark:hover:text-navy-accent/80">{t("jobs")}</Link></li>
          <li aria-hidden="true" className="text-slate-400 dark:text-slate-500">/</li>
          <li className="max-w-[200px] truncate font-medium text-slate-800 sm:max-w-none dark:text-foreground/80">{job.title}</li>
        </ol>
      </motion.nav>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          <motion.h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl dark:text-foreground" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
            {job.title}
          </motion.h1>
          <motion.div className="mt-2 flex items-center gap-3" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            {job.companyLogo ? (
              <img src={job.companyLogo} alt="" className="h-10 w-10 shrink-0 rounded object-contain border border-border-card bg-white dark:border-border-muted dark:bg-card-active" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : null}
            <span className="text-lg text-slate-600 dark:text-foreground/70">{job.company}</span>
          </motion.div>

          <motion.div className="mt-4 flex flex-wrap gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15, ease: easeCubic }}>
            <span className="rounded-full border border-border-card bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-border-muted dark:bg-card-active dark:text-foreground/80">{t("remoteBadge")}</span>
            {job.async && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200">{t("asyncBadge")}</span>
            )}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200">{job.category}</span>
            {job.timezone && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200">{job.timezone}</span>
            )}
            {job.seniority && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200">{job.seniority}</span>
            )}
          </motion.div>

          <motion.dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-foreground/60" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2, ease: easeCubic }}>
            <div><dt className="sr-only">{t("location")}</dt><dd className="flex items-center gap-1"><MapPin size={14} aria-hidden />{job.location}</dd></div>
            {job.salary && (<div><dt className="sr-only">{t("salary")}</dt><dd className="flex items-center gap-1"><Banknote size={14} aria-hidden />{job.salary}</dd></div>)}
            {job.datePosted && (
              <div>
                <dt className="sr-only">{t("posted")}</dt>
                <dd className="flex items-center gap-1"><CalendarDays size={14} aria-hidden />{new Date(job.datePosted).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
              </div>
            )}
          </motion.dl>

          <div className="mt-6 lg:hidden">
            <ApplyCard job={job} candidateApplyData={candidateApplyData} isLoggedIn={isLoggedIn} isEmployer={isEmployer} />
          </div>

          <DescriptionBlock title={t("aboutRole")} content={job.description} delay={0.25} />
          {job.requirements && <DescriptionBlock title={t("requirements")} content={job.requirements} delay={0.35} />}
          {job.benefits && <DescriptionBlock title={t("benefits")} content={job.benefits} delay={0.45} />}
        </div>

        <div className="hidden lg:block">
          <ApplyCard job={job} candidateApplyData={candidateApplyData} isLoggedIn={isLoggedIn} isEmployer={isEmployer} />
        </div>
      </div>
    </>
  );
}
