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
    "w-full px-5 py-3.5 rounded-2xl border border-foreground/10 bg-section-muted text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary focus:bg-background transition-all duration-300 font-medium text-sm";
  const selectClass =
    "w-full px-5 py-3.5 rounded-2xl border border-foreground/10 bg-section-muted text-foreground focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary focus:bg-background transition-all duration-300 font-medium text-sm appearance-none cursor-pointer";

  const SectionLabel = ({ icon: Icon, title, desc }: any) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-navy-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-navy-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground leading-tight">{title}</h3>
        {desc && <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-wider mt-0.5">{desc}</p>}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-navy-primary mb-4 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-navy-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            {t("backToDashboard")}
          </Link>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none">{t("pageTitle")}</h1>
          <p className="text-lg text-foreground/40 mt-3 font-medium">{t("pageSubtitle")}</p>
        </div>
        
        {companyName && (
          <div className="flex items-center gap-4 px-5 py-3 rounded-[2rem] bg-card-background border border-foreground/10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-10 h-10 rounded-2xl bg-navy-primary/10 flex items-center justify-center text-navy-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em] leading-none mb-1">Hiring for</p>
              <p className="text-sm font-bold text-foreground leading-none">{companyName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Section 1: Core Details */}
          <div className="p-8 rounded-[2.5rem] border border-foreground/10 bg-card-background shadow-xl shadow-foreground/[0.02]">
            <SectionLabel icon={FileText} title="Job Fundamentals" desc="The core details of your listing" />

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
                <label className="block text-sm font-bold text-foreground mb-3">
                  {t("category")} <span className="text-navy-primary">*</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
                        category === cat
                          ? "bg-navy-primary text-white shadow-lg shadow-navy-primary/20 scale-[1.02]"
                          : `border border-foreground/10 bg-section-muted hover:border-navy-primary/30 hover:bg-navy-primary/[0.02]`
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${category === cat ? 'bg-white' : 'bg-navy-primary/40 group-hover:bg-navy-primary'} transition-colors`} />
                      {t(`category${cat}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Environment & Compensation */}
          <div className="p-8 rounded-[2.5rem] border border-foreground/10 bg-card-background shadow-xl shadow-foreground/[0.02]">
            <SectionLabel icon={Layers} title="Workspace & Perks" desc="Remote culture and salary details" />

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
                        className="px-3 py-1 rounded-xl bg-navy-primary/10 text-navy-primary text-[10px] font-bold border border-navy-primary/10"
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

        {/* Sidebar Preview Area */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
          <div className="sticky top-24 space-y-6">
            <div className="p-8 rounded-[2.5rem] border border-foreground/10 bg-gradient-to-b from-card-background to-section-muted shadow-2xl shadow-foreground/[0.03] overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-navy-primary/5 rounded-full blur-3xl group-hover:bg-navy-primary/10 transition-colors" />
              
              <div className="relative">
                <h3 className="text-[10px] font-black text-navy-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-navy-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  Live Preview
                </h3>

                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-foreground leading-[1.1] tracking-tight break-words">
                      {title || "Position Title"}
                    </h2>
                    {companyName && (
                      <p className="text-sm font-bold text-foreground/40 mt-2">{companyName}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/10">
                      100% Remote
                    </span>
                    {category && (
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-colors ${
                        category === "Tech" ? "bg-blue-500/5 text-blue-500 border-blue-500/10" :
                        category === "Design" ? "bg-violet-500/5 text-violet-500 border-violet-500/10" :
                        category === "Marketing" ? "bg-amber-500/5 text-amber-500 border-amber-500/10" :
                        "bg-foreground/5 text-foreground/40 border-foreground/5"
                      }`}>
                        {category}
                      </span>
                    )}
                    {asyncLevel && (
                      <span className="px-3 py-1.5 rounded-xl bg-navy-primary/5 text-navy-primary text-[10px] font-black uppercase tracking-wider border border-navy-primary/10">
                        {asyncLevel === "full" ? "Fully Async" : asyncLevel === "friendly" ? "Async Friendly" : "Sync Required"}
                      </span>
                    )}
                  </div>

                  {(salary || location) && (
                    <div className="space-y-1.5 pt-1">
                      {salary && (
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                          <Banknote className="w-4 h-4 text-emerald-500" />
                          <span>€{salary} <span className="text-[10px] text-foreground/30 uppercase tracking-widest ml-1">{salaryPeriod}</span></span>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
                          <MapPin className="w-4 h-4" /> {location}
                        </div>
                      )}
                    </div>
                  )}

                  {description && (
                    <div className="pt-5 border-t border-foreground/5">
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-2">{t("aboutRole")}</p>
                      <p className="text-xs text-foreground/60 leading-relaxed line-clamp-4 whitespace-pre-line font-medium">
                        {description}
                      </p>
                    </div>
                  )}

                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4">
                      {parsedTags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-foreground/5 text-foreground/40 text-[9px] font-black uppercase tracking-wider border border-foreground/5">
                          {tag}
                        </span>
                      ))}
                      {parsedTags.length > 4 && <span className="text-foreground/20 font-black text-[9px]">+{parsedTags.length - 4}</span>}
                    </div>
                  )}

                  {requirements && (
                    <div className="pt-4 border-t border-foreground/5">
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-2">{t("requirements")}</p>
                      <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3 whitespace-pre-line font-medium">
                        {requirements}
                      </p>
                    </div>
                  )}

                  {benefits && (
                    <div className="pt-4">
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-2">{t("benefits")}</p>
                      <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3 whitespace-pre-line font-medium">
                        {benefits}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-navy-primary/10">
                  <div className="space-y-3">
                    {/* Error / Success Feedback */}
                    {error && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in zoom-in-95 duration-200">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200">
                        <CheckCircle className="w-4 h-4" />
                        {success}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmitForReview}
                      disabled={isDisabled}
                      className="w-full h-14 rounded-2xl bg-navy-primary text-white font-black uppercase tracking-widest shadow-xl shadow-navy-primary/20 hover:bg-navy-hover hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                      <span className="text-xs">{submitting ? t("submitting") : t("submitForReview")}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isDisabled}
                      className="w-full h-12 rounded-2xl border border-foreground/10 text-foreground/60 text-[11px] font-black uppercase tracking-widest hover:bg-foreground/5 hover:text-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {loading ? t("savingDraft") : t("saveDraft")}
                    </button>
                  </div>

                  <p className="text-[10px] text-foreground/30 mt-5 text-center leading-relaxed font-bold uppercase tracking-wider">
                    Listing Review Process: <span className="text-foreground/15">12-24h</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
