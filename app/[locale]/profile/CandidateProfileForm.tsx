"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle, Upload, FileText, X, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

type CandidateProfile = {
  fullName: string;
  email: string;
  cvPath: string | null;
} | null;

function extractFileName(storagePath: string): string {
  // Path format: {userId}/{filename}
  const parts = storagePath.split("/");
  return parts.length > 1 ? parts.slice(1).join("/") : storagePath;
}

export default function CandidateProfileForm({
  profile,
  userEmail,
}: {
  profile: CandidateProfile;
  userEmail: string;
}) {
  const t = useTranslations("Profile");
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [email, setEmail] = useState(profile?.email ?? userEmail);
  const [cvPath, setCvPath] = useState(profile?.cvPath ?? "");
  const [cvFileName, setCvFileName] = useState(() =>
    profile?.cvPath ? extractFileName(profile.cvPath) : ""
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(t("errorInvalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("errorFileSize"));
      return;
    }

    setError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t("errorNotAuth"));
        return;
      }

      const oldPath = cvPath;
      const newPath = `${user.id}/${file.name}`;

      // Upload new file first — don't touch old file until success
      const { error: uploadError } = await supabase.storage
        .from("cv-uploads")
        .upload(newPath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        setError(t("errorUpload"));
        return;
      }

      // Upload succeeded — now safe to delete old file (if different path)
      if (oldPath && oldPath !== newPath) {
        const { error: removeError } = await supabase.storage
          .from("cv-uploads")
          .remove([oldPath]);
        if (removeError) {
          // Non-blocking: old file stays as orphan, new file is already in place
          console.warn("Failed to delete old CV:", removeError.message);
        }
      }

      setCvPath(newPath);
      setCvFileName(file.name);
    } catch {
      setError(t("errorUpload"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownloadCv() {
    if (!cvPath) return;
    const supabase = createClient();
    const { data, error: signError } = await supabase.storage
      .from("cv-uploads")
      .createSignedUrl(cvPath, 60);

    if (signError || !data?.signedUrl) {
      setError(t("errorDownload"));
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function handleRemoveCv() {
    if (cvPath) {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from("cv-uploads")
        .remove([cvPath]);
      if (removeError) {
        setError(t("errorRemove"));
        return;
      }
    }
    setCvPath("");
    setCvFileName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!fullName.trim()) {
      setError(`${t("fullName")} ${t("errorRequired")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, cvPath: cvPath || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errorGeneric"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToDashboard")}
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
            {t("fullName")} <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder={t("fullNamePlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-1.5">
            {t("contactEmail")}
          </label>
          <input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("contactEmailPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
          />
          <p className="text-xs text-foreground/40 mt-1">{t("contactEmailHint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("cvResume")}
          </label>

          {cvPath ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-section-muted">
              <FileText className="w-5 h-5 text-navy-primary flex-shrink-0" />
              <span className="flex-1 min-w-0 text-sm text-foreground truncate">
                {cvFileName || t("cvResume")}
              </span>
              <button
                type="button"
                onClick={handleDownloadCv}
                className="flex-shrink-0 p-1 rounded-lg text-foreground/40 hover:text-navy-primary hover:bg-navy-primary/10 transition-colors"
                title={t("cvDownload")}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemoveCv}
                className="flex-shrink-0 p-1 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title={t("cvRemove")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex flex-col items-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-foreground/20 bg-background hover:border-navy-primary/40 hover:bg-navy-primary/5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-navy-primary animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-foreground/40" />
              )}
              <span className="text-sm text-foreground/60">
                {uploading ? t("cvUploading") : t("cvUploadLabel")}
              </span>
              <span className="text-xs text-foreground/30">
                {t("cvUploadHint")}
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            {t("savedSuccess")}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3 px-6 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
