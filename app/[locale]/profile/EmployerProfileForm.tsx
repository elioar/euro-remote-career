"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type EmployerProfile = {
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
} | null;

function extractFileName(url: string): string {
  // Public URL format: .../logo-uploads/{userId}/{filename}
  const parts = url.split("/");
  return parts[parts.length - 1] ?? url;
}

export default function EmployerProfileForm({ profile }: { profile: EmployerProfile }) {
  const t = useTranslations("Profile");
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  // logoUrl now stores the full public URL (or empty string)
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl ?? "");
  const [logoFileName, setLogoFileName] = useState(() =>
    profile?.logoUrl ? extractFileName(profile.logoUrl) : ""
  );
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError(t("logoErrorInvalidType"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t("logoErrorFileSize"));
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

      const newPath = `${user.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("logo-uploads")
        .upload(newPath, file, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (uploadError) {
        setError(t("logoErrorUpload"));
        return;
      }

      // Public bucket — get permanent public URL
      const { data: publicData } = supabase.storage
        .from("logo-uploads")
        .getPublicUrl(newPath);

      setLogoUrl(publicData.publicUrl);
      setLogoFileName(file.name);
    } catch {
      setError(t("logoErrorUpload"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveLogo() {
    // For public buckets we just clear the reference — optionally delete from storage
    setLogoUrl("");
    setLogoFileName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyName.trim()) {
      setError(`${t("companyName")} ${t("errorRequired")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, logoUrl: logoUrl || null, website, description }),
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

  const hasLogo = !!logoUrl;

  return (
    <div className="w-full">
      <div className="mb-6 pl-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToDashboard")}
        </Link>
      </div>

      <div className="p-6 sm:p-8 border border-foreground/10 bg-card-background rounded-[24px] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1.5">
              {t("companyName")} <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder={t("companyNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent focus:bg-background transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("logo")}
            </label>

            {hasLogo ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted">
                <Image
                  src={logoUrl}
                  alt={companyName || "Logo"}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-lg object-contain flex-shrink-0 bg-white shadow-sm border border-black/5"
                  unoptimized
                />
                <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
                  {logoFileName || t("logo")}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground/60 hover:text-foreground border border-foreground/10 hover:bg-foreground/5 hover:border-foreground/20 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("logoChange")}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex-shrink-0 p-1.5 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title={t("logoRemove")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex flex-col items-center gap-3 px-4 py-8 rounded-xl border-2 border-dashed border-foreground/10 bg-section-muted hover:border-navy-primary/30 hover:bg-navy-primary/5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/5 flex items-center justify-center group-hover:bg-navy-primary/10 group-hover:text-navy-primary transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-navy-primary animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-foreground/40 group-hover:text-navy-primary" />
                  )}
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground/70 mb-0.5">
                    {uploading ? t("logoUploading") : t("logoUploadLabel")}
                  </span>
                  <span className="block text-xs text-foreground/40">{t("logoUploadHint")}</span>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
              {t("website")}
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t("websitePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent focus:bg-background transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
              {t("description")}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t("descriptionPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-section-muted text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent focus:bg-background transition-all resize-none"
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-3.5 px-6 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
