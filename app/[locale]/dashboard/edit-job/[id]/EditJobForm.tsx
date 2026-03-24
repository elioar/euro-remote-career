"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

const CATEGORIES = ["Tech", "Design", "Marketing", "Product"] as const;
const ASYNC_LEVELS = ["full", "friendly", "sync"] as const;

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
};

export default function EditJobForm({ job }: { job: Job }) {
  const t = useTranslations("EditJob");
  const tp = useTranslations("PostJob");
  const router = useRouter();

  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [requirements, setRequirements] = useState(job.requirements ?? "");
  const [benefits, setBenefits] = useState(job.benefits ?? "");
  const [category, setCategory] = useState(job.category);
  const [asyncLevel, setAsyncLevel] = useState(job.asyncLevel ?? "");
  const parsedSalary = (() => {
    if (!job.salary) return { value: "", period: "yearly" };
    const match = job.salary.match(/^€(.+)\/(hourly|monthly|yearly)$/);
    if (match) return { value: match[1], period: match[2] };
    return { value: job.salary, period: "yearly" };
  })();
  const [salary, setSalary] = useState(parsedSalary.value);
  const [salaryPeriod, setSalaryPeriod] = useState(parsedSalary.period);
  const [location, setLocation] = useState(job.location ?? "");
  const [tagsInput, setTagsInput] = useState(job.tags.join(", "));

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  async function handleSave() {
    setError("");
    setSuccess("");
    const data = getFormData();

    if (!data.title || !data.description || !data.category) {
      setError(tp("errorRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("errorGeneric"));
        return;
      }

      setSuccess(t("successSaved"));
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
      setError(tp("errorRequired"));
      return;
    }

    setSubmitting(true);
    try {
      // Save first
      const saveRes = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveRes.ok) {
        const json = await saveRes.json();
        setError(json.error || t("errorGeneric"));
        return;
      }

      // Then submit
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition";
  const selectClass =
    "w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition";

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToMyJobs")}
      </Link>

      {/* Rejection banner */}
      {job.status === "REJECTED" && job.rejectionReason && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {t("rejectedBanner")}
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {job.rejectionReason}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("title")} <span className="text-red-500">*</span>
          </label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tp("titlePlaceholder")} className={inputClass} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("aboutRole")} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-foreground/40 mb-2">{tp("aboutRoleHint")}</p>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder={tp("aboutRolePlaceholder")} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("requirements")}
          </label>
          <p className="text-xs text-foreground/40 mb-2">{tp("requirementsHint")}</p>
          <textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} placeholder={tp("requirementsPlaceholder")} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("benefits")}
          </label>
          <p className="text-xs text-foreground/40 mb-2">{tp("benefitsHint")}</p>
          <textarea id="benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder={tp("benefitsPlaceholder")} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("category")} <span className="text-red-500">*</span>
          </label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">{tp("categoryPlaceholder")}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{tp(`category${cat}`)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="asyncLevel" className="block text-sm font-medium text-foreground mb-1.5">
            {tp("asyncLevel")}
          </label>
          <select id="asyncLevel" value={asyncLevel} onChange={(e) => setAsyncLevel(e.target.value)} className={selectClass}>
            <option value="">{tp("asyncLevelPlaceholder")}</option>
            {ASYNC_LEVELS.map((level) => (
              <option key={level} value={level}>{tp(`asyncLevel${level.charAt(0).toUpperCase() + level.slice(1)}` as "asyncLevelFull")}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-foreground mb-1.5">{tp("salary")}</label>
          <div className="flex gap-2">
            <div className="relative flex-[3]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-medium">€</span>
              <input id="salary" type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={tp("salaryPlaceholder")} className={`${inputClass} pl-8`} />
            </div>
            <select value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value)} className={`${selectClass} flex-1`}>
              <option value="hourly">{tp("salaryHourly")}</option>
              <option value="monthly">{tp("salaryMonthly")}</option>
              <option value="yearly">{tp("salaryYearly")}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1.5">{tp("location")}</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={tp("locationPlaceholder")} className={inputClass} />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1.5">{tp("tags")}</label>
          <input id="tags" type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={tp("tagsPlaceholder")} className={inputClass} />
          <p className="text-xs text-foreground/40 mt-1">{tp("tagsHint")}</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isDisabled}
            className="flex-1 py-3 px-6 rounded-xl border border-foreground/20 text-foreground font-semibold hover:bg-section-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t("saving") : t("saveChanges")}
          </button>
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={isDisabled}
            className="flex-1 py-3 px-6 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? t("submitting") : t("submitForReview")}
          </button>
        </div>
      </div>
    </div>
  );
}
