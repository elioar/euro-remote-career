"use client";

import { useMemo, useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  MapPin,
  Banknote,
  CalendarDays,
  ExternalLink,
  X,
  Mail,
  Search,
  Bookmark,
  Check,
  Bell,
  Settings,
  SlidersHorizontal,
  LogOut,
  User,
  CheckCircle,
} from "lucide-react";
import { DEMO_JOBS, type DemoJob, type JobCategory } from "@/lib/demo-jobs";
import { ProfileSidebar } from "@/app/components/ProfileSidebar";
import { createClient } from "@/lib/supabase/client";
import { ApplyModal } from "@/app/[locale]/jobs/[slug]/ApplyModal";

type CandidateCV = { id: string; fileName: string; storagePath: string };

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeCubic } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const CATEGORIES: JobCategory[] = ["Tech", "Design", "Marketing", "Product"];
const PER_PAGE = 8;

const CATEGORY_COLORS: Record<JobCategory, { pill: string }> = {
  Tech: { pill: "dark:border-border-muted dark:text-foreground/80" },
  Design: { pill: "dark:border-border-muted dark:text-foreground/80" },
  Marketing: { pill: "dark:border-border-muted dark:text-foreground/80" },
  Product: { pill: "dark:border-border-muted dark:text-foreground/80" },
};

function timeAgo(dateStr: string, locale: string): string {
  const minutesDiff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  const safeDiff = Number.isFinite(minutesDiff) ? Math.max(0, minutesDiff) : 0;
  const rtf = new Intl.RelativeTimeFormat(locale === "el" ? "el" : "en", {
    numeric: "auto",
    style: "short",
  });

  if (safeDiff < 60) return rtf.format(-safeDiff, "minute");
  if (safeDiff < 1440) return rtf.format(-Math.floor(safeDiff / 60), "hour");
  return rtf.format(-Math.floor(safeDiff / 1440), "day");
}

function JobCard({
  job,
  tc,
  td,
  locale,
  selected,
  onClick,
}: {
  job: DemoJob;
  tc: ReturnType<typeof useTranslations>;
  td: ReturnType<typeof useTranslations>;
  locale: string;
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
          ? "border-navy-primary bg-navy-primary/5 dark:border-card-selected-border dark:bg-card-selected-bg"
          : "border-border-card bg-white dark:border-border-card dark:bg-card-background hover:dark:bg-card-active hover:dark:border-white/20"
      }`}
    >
      {/* Top row: logo + title/company + salary */}
      <div className="flex items-start gap-3">
        {job.companyLogo && (
          <img
            src={job.companyLogo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl border border-border-card object-contain p-1 dark:border-border-muted dark:bg-card-active"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-foreground">{job.title}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-foreground/70">
            {job.company}
            {job.timezone && <span className="ml-1.5 text-slate-400 dark:text-foreground/50"> - {job.timezone}</span>}
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
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground">
            {job.employmentType}
          </span>
        )}
        {job.async && (
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground">
            {tc("asyncFriendly")}
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center gap-4">
        {job.datePosted && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock size={11} aria-hidden />
            {timeAgo(job.datePosted, locale)}
          </span>
        )}
        {job.applicants !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Users size={11} aria-hidden />
            {td("applications", { count: job.applicants })}
          </span>
        )}
        {job.urgent && (
          <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-500 dark:bg-red-500/10 dark:text-red-400">
            {td("urgent")}
          </span>
        )}
      </div>
    </motion.article>
  );
}

function JobDetailInner({
  job,
  tc,
  td,
  onApply,
  isApplied,
}: {
  job: DemoJob;
  tc: ReturnType<typeof useTranslations>;
  td: ReturnType<typeof useTranslations>;
  onApply?: (job: DemoJob) => void;
  isApplied?: boolean;
}) {
  const locale = useLocale();
  const accent = CATEGORY_COLORS[job.category];
  const paragraphs = (text: string) => text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border-muted p-5 dark:border-border-muted">
        <div className="flex items-start gap-3">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-border-card object-contain p-1 dark:border-border-muted dark:bg-card-active"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">{job.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-foreground/60">{job.company}</p>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label={td("saveJob")}
          >
            <Bookmark size={16} />
          </button>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-foreground/75">
          <span className="flex items-center gap-1"><MapPin size={13} className="text-slate-400 dark:text-foreground/50" aria-hidden />{job.location === "Remote" ? tc("remote") : job.location}</span>
          {job.salary && <span className="flex items-center gap-1"><Banknote size={13} className="text-slate-400 dark:text-foreground/50" aria-hidden />{job.salary}/yr</span>}
          {job.datePosted && <span className="flex items-center gap-1"><CalendarDays size={13} className="text-slate-400 dark:text-foreground/50" aria-hidden />{new Date(job.datePosted).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent.pill}`}>{job.category}</span>
          {job.employmentType && <span className="rounded-full border border-border-card px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground">{job.employmentType}</span>}
          {job.async && <span className="rounded-full border border-border-card px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground">{tc("asyncFriendly")}</span>}
          {job.urgent && <span className="rounded-full border border-border-card px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-border-muted dark:text-foreground">{td("urgent")}</span>}
        </div>

        {/* Apply buttons */}
        <div className="mt-4 flex gap-2">
          {job.isInternalJob && onApply ? (
            isApplied ? (
              <div className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 cursor-default">
                <CheckCircle size={14} aria-hidden /> {td("applicationSubmitted")}
              </div>
            ) : (
              <button
                onClick={() => onApply(job)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
              >
                {td("applyNow")}
              </button>
            )
          ) : (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
            >
              {td("applyNow")} <ExternalLink size={13} aria-hidden />
            </a>
          )}
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-border-card px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {td("fullDetails")}
          </Link>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto space-y-6 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 custom-scrollbar">
        <section>
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-foreground">{td("aboutRole")}</h3>
          <div className="space-y-3 dark:text-foreground/85">{paragraphs(job.description).map((p, i) => <p key={i}>{p}</p>)}</div>
        </section>
        {job.requirements && (
          <section>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-foreground">{td("requirements")}</h3>
            <div className="space-y-3 dark:text-foreground/85">{paragraphs(job.requirements).map((p, i) => <p key={i}>{p}</p>)}</div>
          </section>
        )}
        {job.benefits && (
          <section>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-foreground">{td("benefits")}</h3>
            <div className="space-y-3 dark:text-foreground/85">{paragraphs(job.benefits).map((p, i) => <p key={i}>{p}</p>)}</div>
          </section>
        )}
      </div>

    </div>
  );
}

function MobileJobSheet({
  job,
  tc,
  td,
  onClose,
  onApply,
  isApplied,
}: {
  job: DemoJob;
  tc: ReturnType<typeof useTranslations>;
  td: ReturnType<typeof useTranslations>;
  onClose: () => void;
  onApply?: (job: DemoJob) => void;
  isApplied?: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[220] lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-label={td("closeDetails")}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-border-card bg-white dark:border-slate-700/50 dark:bg-card-background"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
      >
        <div className="relative shrink-0 border-b border-border-muted px-5 pb-3 pt-3 dark:border-border-muted">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label={td("close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <JobDetailInner job={job} tc={tc} td={td} onApply={onApply} isApplied={isApplied} />
        </div>
      </motion.div>
    </motion.div>
  );
}

type CandidateDashboardContentProps = {
  displayName?: string;
  email?: string | null;
  dbJobs?: DemoJob[];
  cvs?: CandidateCV[];
};

export function CandidateDashboardContent({
  displayName,
  email,
  dbJobs = [],
  cvs = [],
}: CandidateDashboardContentProps) {
  const t = useTranslations("Dashboard");
  const td = useTranslations("DashboardCandidate");
  const tp = useTranslations("JobsPage");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | "">("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [asyncOnly, setAsyncOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<DemoJob | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const [applyModalJob, setApplyModalJob] = useState<DemoJob | null>(null);
  const [localAppliedIds, setLocalAppliedIds] = useState<Set<string>>(new Set());

  const isJobApplied = (job: DemoJob) =>
    !!job.jobDbId && localAppliedIds.has(job.jobDbId);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Drag-to-scroll logic for categories
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.clientX - scrollRef.current.getBoundingClientRect().left;
      const walk = (x - startX) * 2;
      if (Math.abs(walk) > 5) setHasMoved(true);
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      // Reset hasMoved after a short delay to allow onClick to check it
      setTimeout(() => setHasMoved(false), 50);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.clientX - scrollRef.current.getBoundingClientRect().left);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const filtered = useMemo(() => {
    let list = [...dbJobs, ...DEMO_JOBS];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
    if (category) list = list.filter((j) => j.category === category);
    if (remoteOnly) list = list.filter((j) => j.location.toLowerCase() === "remote");
    if (asyncOnly) list = list.filter((j) => j.async === true);
    return list;
  }, [query, category, remoteOnly, asyncOnly]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const visibleJobs = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const hasMoreJobs = visibleCount < filtered.length;

  const activeDesktopJob = useMemo(() => {
    if (!isDesktop) return null;
    if (visibleJobs.length === 0) return null;
    if (selectedJob && visibleJobs.some((job) => job.id === selectedJob.id)) {
      return selectedJob;
    }
    return visibleJobs[0];
  }, [visibleJobs, selectedJob, isDesktop]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const leftChromeRef = useRef<HTMLDivElement>(null);
  const jobListRef = useRef<HTMLDivElement>(null);
  const detailColumnRef = useRef<HTMLDivElement>(null);
  const detailChromeRef = useRef<HTMLDivElement>(null);
  const [jobListMaxHeight, setJobListMaxHeight] = useState<number | null>(null);
  const [detailMaxHeight, setDetailMaxHeight] = useState<number | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!isDesktop) return;

    const computeHeight = () => {
      if (
        !sidebarRef.current ||
        !leftColumnRef.current ||
        !leftChromeRef.current ||
        !detailColumnRef.current ||
        !detailChromeRef.current
      ) {
        return;
      }
      const sidebarRectHeight = sidebarRef.current.getBoundingClientRect().height;
      setSidebarHeight(sidebarRectHeight);
      const leftGap = parseFloat(getComputedStyle(leftColumnRef.current).rowGap || "0");
      const leftChromeHeight = leftChromeRef.current.getBoundingClientRect().height;
      const nextHeight = sidebarRectHeight - leftChromeHeight - leftGap;
      if (!Number.isNaN(nextHeight)) {
        setJobListMaxHeight(Math.max(nextHeight, 200));
      }

      const gutter = parseFloat(getComputedStyle(detailColumnRef.current).rowGap || "0");
      const detailChromeHeight = detailChromeRef.current.getBoundingClientRect().height;
      const detailAvailable = sidebarRectHeight - detailChromeHeight - gutter;
      if (!Number.isNaN(detailAvailable)) {
        setDetailMaxHeight(Math.max(detailAvailable, 200));
      }
    };

    computeHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", computeHeight);
      return () => window.removeEventListener("resize", computeHeight);
    }

    const observers: ResizeObserver[] = [];
    [sidebarRef, leftColumnRef, leftChromeRef, detailColumnRef, detailChromeRef].forEach((ref) => {
      if (!ref.current) return;
      const observer = new ResizeObserver(() => computeHeight());
      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [isDesktop]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 grid grid-cols-1 gap-6 items-center lg:grid-cols-[1fr_minmax(0,2fr)_1fr]">
        <div className="lg:col-span-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:whitespace-nowrap">
            {td("welcomeBack", { name: displayName || td("fallbackName") })} 🔥
          </h1>
          <p className="text-slate-500 dark:text-foreground/60 mt-1 text-base sm:text-lg">{td("welcomeSubtitle")}</p>
        </div>

        {/* Middle column - Mail & Bell Icons */}
        <div className="hidden lg:col-span-1 lg:flex items-center justify-end gap-5">
          <button
            type="button"
            aria-label={td("messages")}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all"
          >
            <Mail className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label={td("notifications")}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-white dark:bg-card-active border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 dark:text-foreground/70 hover:text-navy-primary dark:hover:text-white transition-all relative"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Right column - Divider & Profile (Refined minimal layout) */}
        <div className="hidden lg:col-span-1 lg:flex items-center">
          <div className="h-12 w-px bg-slate-200 dark:bg-white/10 hidden lg:block shrink-0" />
          
          <div className="flex items-center gap-4 group ml-4">
            <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-card-active flex items-center justify-center">
               <User className="h-7 w-7 text-slate-300 dark:text-foreground/20" />
            </div>
            <div className="hidden min-[1200px]:block">
              <h3 className="text-base font-bold text-foreground leading-tight">
                {displayName || td("fallbackName")}
              </h3>
              <p className="text-sm font-medium text-slate-400 dark:text-foreground/40 mt-0.5">
                {email || td("fallbackEmail")}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Link 
                href="/profile"
                className="p-2 rounded-lg text-slate-300 hover:text-navy-primary transition-colors"
                title={td("profileSettings")}
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                title={t("signOut")}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] gap-6 items-start">

        {/* Column 1: Job List */}
        <div className="self-start flex min-h-0 flex-col gap-6 lg:sticky lg:top-8" ref={leftColumnRef}>
          <div className="flex flex-col gap-6 shrink-0" ref={leftChromeRef}>
            {/* Categories - Redesigned as header-style pills */}
            <div className="relative group shrink-0">
              <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                className={`flex items-center gap-1 rounded-full bg-slate-50/50 p-1 border border-border-muted dark:bg-card-background dark:border-border-muted overflow-x-auto no-scrollbar active:cursor-grabbing ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              >
                {(["", ...CATEGORIES] as (JobCategory | "")[]).map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat || "all"}
                      onClick={() => {
                        if (hasMoved) return;
                        setCategory(cat);
                        setVisibleCount(PER_PAGE);
                      }}
                      className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors shrink-0 pointer-events-auto select-none ${
                        isActive 
                          ? "text-navy-primary dark:text-foreground" 
                          : "text-slate-500 hover:text-navy-primary dark:text-foreground/70 dark:hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="active-category-pill"
                          className="absolute inset-0 rounded-full bg-white shadow-sm border border-border-muted dark:bg-card-active dark:border-border-muted"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 28,
                          }}
                        />
                      )}
                      <span className="relative z-10">{cat || td("allCategories")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => {
                  setRemoteOnly(!remoteOnly);
                  setVisibleCount(PER_PAGE);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all border ${
                  remoteOnly
                    ? "bg-navy-primary/10 border-navy-primary/50 text-navy-primary dark:bg-card-selected-bg dark:border-card-selected-border dark:text-blue-400"
                    : "bg-white/50 border-slate-200 text-slate-500 dark:bg-card-active/50 dark:border-white/5 dark:text-slate-400"
                }`}
              >
                <div className={`h-4 w-4 rounded-full flex items-center justify-center border transition-all ${
                  remoteOnly 
                    ? "bg-navy-primary border-navy-primary dark:bg-blue-500 dark:border-blue-500" 
                    : "bg-transparent border-slate-300 dark:border-slate-600"
                }`}>
                  {remoteOnly && <Check className="h-3 w-3 text-white" />}
                </div>
                {tp("remoteOnly")}
              </button>
              <button
                onClick={() => {
                  setAsyncOnly(!asyncOnly);
                  setVisibleCount(PER_PAGE);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all border ${
                  asyncOnly
                    ? "bg-navy-primary/10 border-navy-primary/50 text-navy-primary dark:bg-card-selected-bg dark:border-card-selected-border dark:text-blue-400"
                    : "bg-white/50 border-slate-200 text-slate-500 dark:bg-card-active/50 dark:border-white/5 dark:text-slate-400"
                }`}
              >
                <div className={`h-4 w-4 rounded-full flex items-center justify-center border transition-all ${
                  asyncOnly 
                    ? "bg-navy-primary border-navy-primary dark:bg-blue-500 dark:border-blue-500" 
                    : "bg-transparent border-slate-300 dark:border-slate-600"
                }`}>
                  {asyncOnly && <Check className="h-3 w-3 text-white" />}
                </div>
                {tc("asyncFriendly")}
              </button>
            </div>
          </div>

          {/* List */}
          <div
            ref={jobListRef}
            className="flex flex-1 flex-col gap-3 pr-1 overflow-y-auto no-scrollbar lg:edge-fade-bottom"
            style={isDesktop && jobListMaxHeight ? { maxHeight: `${jobListMaxHeight}px` } : undefined}
          >
            <AnimatePresence mode="popLayout">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  tc={tc}
                  td={td}
                  locale={locale}
                  selected={(isDesktop ? activeDesktopJob : selectedJob)?.id === job.id}
                  onClick={() => setSelectedJob(job)}
                />
              ))}
            </AnimatePresence>
            {hasMoreJobs && (
              <div className="mt-2 flex flex-col items-center gap-1 pb-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PER_PAGE)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-border-muted dark:bg-card-background dark:text-slate-200 dark:hover:bg-card-active"
                >
                  {tp("loadMore")}
                </button>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {tp("showingCount", { shown: visibleJobs.length, total: filtered.length })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Job Detail Container */}
        <div
          className="hidden lg:flex sticky top-8 self-start flex-col gap-5 overflow-hidden min-h-0"
          ref={detailColumnRef}
          style={sidebarHeight ? { height: `${sidebarHeight}px` } : undefined}
        >
          {/* Search Bar + Menu button (Aligned with categories) */}
          <div className="flex items-center gap-2 shrink-0" ref={detailChromeRef}>
            <div className="flex-1 flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 sm:rounded-full dark:bg-card-active border border-slate-200 dark:border-slate-700/50">
              <label className="relative flex-1 rounded-xl focus-within:bg-white focus-within:shadow-sm sm:rounded-full dark:focus-within:bg-card-background">
                <span className="sr-only">{td("search")}</span>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <input
                  type="search"
                  placeholder={td("searchPlaceholder")}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisibleCount(PER_PAGE);
                  }}
                  className="w-full rounded-full border-0 bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-0 dark:placeholder:text-foreground/50"
                />
              </label>
            </div>
            <button
              type="button"
              aria-label={td("filters")}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-card-active border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-card-active transition-colors shadow-sm shrink-0"
            >
              <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400 dark:text-slate-300" />
            </button>
          </div>

          {/* Preview Panel */}
          <div
            className="flex-1 min-h-0 overflow-hidden rounded-[32px] border border-border-card bg-white dark:border-slate-700/50 dark:bg-card-background"
            style={detailMaxHeight ? { maxHeight: `${detailMaxHeight}px` } : undefined}
          >
           <AnimatePresence mode="wait">
            {activeDesktopJob ? (
              <motion.div 
                key={activeDesktopJob.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <JobDetailInner job={activeDesktopJob} tc={tc} td={td} onApply={setApplyModalJob} isApplied={isJobApplied(activeDesktopJob)} />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center">
                <p className="text-slate-400">{td("selectJob")}</p>
              </div>
            )}
           </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Profile Sidebar */}
        <div className="hidden self-start flex-col gap-6 lg:sticky lg:top-8 lg:flex" ref={sidebarRef}>
            <ProfileSidebar 
              displayName={displayName}
            />
        </div>

      </div>

      <AnimatePresence>
        {!isDesktop && selectedJob && (
          <MobileJobSheet job={selectedJob} tc={tc} td={td} onClose={() => setSelectedJob(null)} onApply={setApplyModalJob} isApplied={isJobApplied(selectedJob)} />
        )}
      </AnimatePresence>

      {applyModalJob && (
        <ApplyModal
          jobId={applyModalJob.jobDbId!}
          jobTitle={applyModalJob.title}
          company={applyModalJob.company}
          candidateName={displayName || ""}
          candidateEmail={email || ""}
          cvs={cvs}
          onClose={() => setApplyModalJob(null)}
          onSuccess={() => {
            if (applyModalJob.jobDbId) {
              setLocalAppliedIds((prev) => new Set([...prev, applyModalJob.jobDbId!]));
            }
            setApplyModalJob(null);
          }}
        />
      )}
    </div>
  );
}
