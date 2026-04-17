"use client";

import { useState, useRef, useEffect } from "react";
import { X, FileText, Upload, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

type CandidateCV = {
  id: string;
  fileName: string;
  storagePath: string;
};

type Props = {
  jobId: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  candidateEmail: string;
  cvs: CandidateCV[];
  onClose: () => void;
  onSuccess: () => void;
};

export function ApplyModal({
  jobId,
  jobTitle,
  company,
  candidateName,
  candidateEmail,
  cvs: initialCvs,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("Apply");
  const [cvs, setCvs] = useState<CandidateCV[]>(initialCvs);
  const [selectedCvId, setSelectedCvId] = useState<string>(initialCvs[0]?.id ?? "");
  const [coverLetter, setCoverLetter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function handleUploadNewCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) { setError(t("errorInvalidType")); return; }
    if (file.size > 5 * 1024 * 1024) { setError(t("errorFileSize")); return; }

    setError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError(t("errorNotAuth")); return; }

      const storagePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cv-uploads")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false, contentType: file.type });

      if (uploadError) { setError(t("errorUpload")); return; }

      const res = await fetch("/api/candidate/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, storagePath }),
      });

      if (!res.ok) {
        await supabase.storage.from("cv-uploads").remove([storagePath]);
        setError(t("errorUpload"));
        return;
      }

      const { cv } = await res.json();
      setCvs((prev) => [cv, ...prev]);
      setSelectedCvId(cv.id);
    } catch {
      setError(t("errorUpload"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const selectedCv = cvs.find((c) => c.id === selectedCvId);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          cvPath: selectedCv?.storagePath ?? null,
          coverLetter: coverLetter.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errorGeneric"));
        return;
      }

      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f111a] shadow-2xl border border-foreground/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/8">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("title")}</h2>
            <p className="text-sm text-foreground/50 mt-0.5">{jobTitle} · {company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("successTitle")}</h3>
            <p className="text-sm text-foreground/60">{t("successDesc")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Applying as */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-primary/5 border border-navy-primary/20">
              <div className="w-9 h-9 rounded-full bg-navy-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-white uppercase">
                  {candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{candidateName}</p>
                <p className="text-xs text-foreground/50 truncate">{candidateEmail}</p>
              </div>
            </div>

            {/* CV selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("selectCV")}</label>

              {cvs.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-foreground/20 text-center">
                  <p className="text-sm text-foreground/50">{t("noCVDesc")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cvs.map((cv) => (
                    <label
                      key={cv.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedCvId === cv.id
                          ? "border-navy-primary bg-navy-primary/5"
                          : "border-foreground/15 hover:border-foreground/30 bg-background"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cv"
                        value={cv.id}
                        checked={selectedCvId === cv.id}
                        onChange={() => setSelectedCvId(cv.id)}
                        className="accent-navy-primary"
                      />
                      <FileText className={`w-4 h-4 shrink-0 ${selectedCvId === cv.id ? "text-navy-primary" : "text-foreground/40"}`} />
                      <span className="text-sm text-foreground truncate">{cv.fileName}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Upload new */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-foreground/20 text-sm text-foreground/50 hover:border-navy-primary/40 hover:text-navy-primary hover:bg-navy-primary/5 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? t("uploading") : t("uploadNew")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUploadNewCV}
                className="hidden"
              />
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("coverLetterLabel")}</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={t("coverLetterPlaceholder")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-foreground/20 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting || (cvs.length === 0)}
                className="flex-1 py-3 rounded-xl bg-navy-primary text-white text-sm font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {submitting ? t("submitting") : t("submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
