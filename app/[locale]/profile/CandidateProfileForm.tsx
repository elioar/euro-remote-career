"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle, Upload, FileText, X, Download, Trash2, Camera, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

type CandidateCV = {
  id: string;
  fileName: string;
  storagePath: string;
  uploadedAt: string;
};

type CandidateProfile = {
  fullName: string;
  email: string;
  address?: string | null;
  occupation?: string | null;
  birthDate?: Date | string | null;
  profileImageUrl?: string | null;
  cvs: CandidateCV[];
} | null;

export default function CandidateProfileForm({
  profile,
  userEmail,
  hideBackLink = false,
}: {
  profile: CandidateProfile;
  userEmail: string;
  hideBackLink?: boolean;
}) {
  const t = useTranslations("Profile");
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [email, setEmail] = useState(profile?.email ?? userEmail);
  const [address, setAddress] = useState(profile?.address ?? "");
  const [occupation, setOccupation] = useState(profile?.occupation ?? "");
  const [birthDate, setBirthDate] = useState(
    profile?.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : ""
  );
  const [profileImageUrl, setProfileImageUrl] = useState(profile?.profileImageUrl ?? "");
  const [cvs, setCvs] = useState<CandidateCV[]>(profile?.cvs ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("errorInvalidImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("errorFileSize"));
      return;
    }

    setError("");
    setUploadingImage(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError(t("errorNotAuth")); return; }

      const ext = file.name.split(".").pop();
      const storagePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(storagePath, file, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (uploadError) { setError(uploadError.message || t("errorUpload")); return; }

      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(storagePath);

      setProfileImageUrl(publicUrl);
    } catch {
      setError(t("errorUpload"));
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

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
    } catch {
      setError(t("errorUpload"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownloadCv(storagePath: string) {
    const supabase = createClient();
    const { data, error: signError } = await supabase.storage
      .from("cv-uploads")
      .createSignedUrl(storagePath, 60);
    if (signError || !data?.signedUrl) { setError(t("errorDownload")); return; }
    window.open(data.signedUrl, "_blank");
  }

  async function handleRemoveCv(cv: CandidateCV) {
    const supabase = createClient();
    await supabase.storage.from("cv-uploads").remove([cv.storagePath]);
    const res = await fetch(`/api/candidate/cvs/${cv.id}`, { method: "DELETE" });
    if (!res.ok) { setError(t("errorRemove")); return; }
    setCvs((prev) => prev.filter((c) => c.id !== cv.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!fullName.trim()) { setError(`${t("fullName")} ${t("errorRequired")}`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, address, occupation, birthDate: birthDate || null, profileImageUrl: profileImageUrl || null }),
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
      {!hideBackLink && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToDashboard")}
        </Link>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="relative h-24 w-24 rounded-full border-2 border-dashed border-foreground/20 overflow-hidden cursor-pointer hover:border-navy-primary/60 transition-colors group"
            onClick={() => imageInputRef.current?.click()}
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-card-active">
                <User className="w-10 h-10 text-slate-300 dark:text-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <p className="text-xs text-foreground/40">{t("profileImageHint")}</p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleProfileImageUpload}
            className="hidden"
          />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-foreground mb-1.5">
              {t("occupation")}
            </label>
            <input
              id="occupation"
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder={t("occupationPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-foreground mb-1.5">
              {t("birthDate")}
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
            {t("address")}
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("addressPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
          />
        </div>

        {/* CV Management */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              {t("cvResume")}
              {cvs.length > 0 && (
                <span className="ml-2 text-xs font-normal text-foreground/40">
                  {t("cvCount", { count: cvs.length })}
                </span>
              )}
            </label>
          </div>

          {cvs.length > 0 && (
            <div className="space-y-2 mb-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-section-muted"
                >
                  <FileText className="w-5 h-5 text-navy-primary flex-shrink-0" />
                  <span className="flex-1 min-w-0 text-sm text-foreground truncate">{cv.fileName}</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCv(cv.storagePath)}
                    className="flex-shrink-0 p-1 rounded-lg text-foreground/40 hover:text-navy-primary hover:bg-navy-primary/10 transition-colors"
                    title={t("cvDownload")}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCv(cv)}
                    className="flex-shrink-0 p-1 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title={t("cvRemove")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-foreground/20 bg-background hover:border-navy-primary/40 hover:bg-navy-primary/5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-navy-primary animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-foreground/40" />
            )}
            <span className="text-sm text-foreground/60">
              {uploading ? t("cvUploading") : cvs.length > 0 ? t("cvUploadAnother") : t("cvUploadLabel")}
            </span>
            <span className="text-xs text-foreground/30">{t("cvUploadHint")}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            {t("savedSuccess")}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading || uploadingImage}
          className="w-full py-3 px-6 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
