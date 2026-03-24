"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  FileText,
  Tag,
  Banknote,
  MapPin,
  Layers,
  Clock,
  Send,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";

const CATEGORIES = ["Tech", "Design", "Marketing", "Product"] as const;
const ASYNC_LEVELS = ["full", "friendly", "sync"] as const;

const CATEGORY_ICONS: Record<string, string> = {
  Tech: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Design: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Marketing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Product: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default function PostJobForm({
  hasProfile,
  companyName,
}: {
  hasProfile: boolean;
  companyName?: string | null;
}) {
  const t = useTranslations("PostJob");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [category, setCategory] = useState("");
  const [asyncLevel, setAsyncLevel] = useState("");
  const [salary, setSalary] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("yearly");
  const [location, setLocation] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!hasProfile) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-navy-primary/10 flex items-center justify-center mx-auto mb-5">
          <Briefcase className="w-8 h-8 text-navy-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t("errorNoProfile")}</h2>
        <p className="text-foreground/50 text-sm mb-6">Set up your company profile before posting jobs.</p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors"
        >
          Set up profile
        </Link>
      </div>
    );
  }

  function getFormData() {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim() || null,
      benefits: benefits.trim() || null,
      category,
      remoteType: "remote",
      asyncLevel: asyncLevel || null,
      timezone: null,
      salary: salary.trim() ? `€${salary.trim()}/${salaryPeriod}` : null,
      location: location.trim() || null,
      tags,
    };
  }

  async function handleSaveDraft() {
    setError("");
    setSuccess("");
    const data = getFormData();

    if (!data.title || !data.description || !data.category) {
      setError(t("errorRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }

      setSuccess(t("successDraft"));
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitForReview() {
    setError("");
    setSuccess("");
    const data = getFormData();

    if (!data.title || !data.description || !data.category) {
      setError(t("errorRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!createRes.ok) {
        const json = await createRes.json();
        setError(json.error || t("errorGeneric"));
        return;
      }

      const job = await createRes.json();

      const submitRes = await fetch(`/api/jobs/${job.id}/submit`, {
        method: "POST",
      });

      if (!submitRes.ok) {
        const json = await submitRes.json();
        setError(json.error || t("errorGeneric"));
        return;
      }

      setSuccess(t("successSubmitted"));
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = loading || submitting;
  const parsedTags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent focus:bg-background transition-all";
  const selectClass =
    "w-full px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted text-foreground focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent focus:bg-background transition-all";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{t("pageTitle")}</h1>
          <p className="text-foreground/50 mt-1">{t("pageSubtitle")}</p>
        </div>
        {companyName && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-section-muted border border-foreground/10">
            <div className="w-8 h-8 rounded-lg bg-navy-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-navy-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{companyName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form - left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Basics Card */}
          <div className="p-6 rounded-2xl border border-foreground/10 bg-background">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-navy-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-navy-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Job Details</h2>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("title")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("titlePlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* About the Role */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("aboutRole")} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-foreground/40 mb-2">{t("aboutRoleHint")}</p>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder={t("aboutRolePlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* What You'll Need */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("requirements")}
                </label>
                <p className="text-xs text-foreground/40 mb-2">{t("requirementsHint")}</p>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder={t("requirementsPlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* What You Get */}
              <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("benefits")}
                </label>
                <p className="text-xs text-foreground/40 mb-2">{t("benefitsHint")}</p>
                <textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={3}
                  placeholder={t("benefitsPlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Category - pill selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2.5">
                  {t("category")} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        category === cat
                          ? "bg-navy-primary text-white shadow-sm"
                          : `border border-foreground/10 ${CATEGORY_ICONS[cat]} hover:border-foreground/20`
                      }`}
                    >
                      {t(`category${cat}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Card */}
          <div className="p-6 rounded-2xl border border-foreground/10 bg-background">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-navy-primary/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-navy-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Additional Info</h2>
              <span className="text-xs text-foreground/40 ml-1">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Async Level */}
              <div>
                <label htmlFor="asyncLevel" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-foreground/40" />
                  {t("asyncLevel")}
                </label>
                <select
                  id="asyncLevel"
                  value={asyncLevel}
                  onChange={(e) => setAsyncLevel(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{t("asyncLevelPlaceholder")}</option>
                  {ASYNC_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {t(`asyncLevel${level.charAt(0).toUpperCase() + level.slice(1)}` as "asyncLevelFull")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary */}
              <div>
                <label htmlFor="salary" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <Banknote className="w-3.5 h-3.5 text-foreground/40" />
                  {t("salary")}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-[3]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-medium">€</span>
                    <input
                      id="salary"
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder={t("salaryPlaceholder")}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <select
                    value={salaryPeriod}
                    onChange={(e) => setSalaryPeriod(e.target.value)}
                    className={`${selectClass} flex-1`}
                  >
                    <option value="hourly">{t("salaryHourly")}</option>
                    <option value="monthly">{t("salaryMonthly")}</option>
                    <option value="yearly">{t("salaryYearly")}</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label htmlFor="location" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foreground/40" />
                  {t("location")}
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("locationPlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* Tags */}
              <div className="sm:col-span-2">
                <label htmlFor="tags" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-foreground/40" />
                  {t("tags")}
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t("tagsPlaceholder")}
                  className={inputClass}
                />
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {parsedTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-navy-primary/10 text-navy-primary text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-foreground/30 mt-1.5">{t("tagsHint")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - right col */}
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="p-5 rounded-2xl border border-foreground/10 bg-background sticky top-24">
            <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
              Preview
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {title || "Job Title"}
                </p>
                {companyName && (
                  <p className="text-sm text-foreground/50 mt-0.5">{companyName}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                  Remote
                </span>
                {category && (
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${CATEGORY_ICONS[category] || "bg-section-muted text-foreground/60"}`}>
                    {category}
                  </span>
                )}
                {asyncLevel && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    {asyncLevel === "full" ? "Fully Async" : asyncLevel === "friendly" ? "Async-Friendly" : "Mostly Sync"}
                  </span>
                )}
              </div>

              {salary && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">€{salary}/{salaryPeriod}</p>
              )}

              {location && (
                <p className="text-xs text-foreground/40 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {location}
                </p>
              )}

              {description && (
                <div className="pt-3 border-t border-foreground/5">
                  <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1">About the Role</p>
                  <p className="text-xs text-foreground/50 line-clamp-3 whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {requirements && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1">What You&apos;ll Need</p>
                  <p className="text-xs text-foreground/50 line-clamp-2 whitespace-pre-line">
                    {requirements}
                  </p>
                </div>
              )}

              {benefits && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1">What You Get</p>
                  <p className="text-xs text-foreground/50 line-clamp-2 whitespace-pre-line">
                    {benefits}
                  </p>
                </div>
              )}

              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {parsedTags.slice(0, 5).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {parsedTags.length > 5 && (
                    <span className="text-foreground/30 text-[10px]">+{parsedTags.length - 5}</span>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/5 mt-5 pt-5">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
                Actions
              </h3>

              {/* Error / Success */}
              {error && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl mb-3">
                  {error}
                </p>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-xl mb-3">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={isDisabled}
                  className="w-full py-3 px-5 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? t("submitting") : t("submitForReview")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isDisabled}
                  className="w-full py-3 px-5 rounded-xl border border-foreground/10 text-foreground font-medium hover:bg-section-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-foreground/40" />
                  )}
                  {loading ? t("savingDraft") : t("saveDraft")}
                </button>
              </div>

              <p className="text-[11px] text-foreground/30 mt-3 text-center leading-snug">
                Jobs are reviewed before publishing. You&apos;ll be notified once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
