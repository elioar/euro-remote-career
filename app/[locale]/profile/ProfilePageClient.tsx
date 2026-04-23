"use client";

import { useState } from "react";
import { User, Lock, Building2, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import CandidateProfileForm from "./CandidateProfileForm";
import EmployerProfileForm from "./EmployerProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

type Tab = "profile" | "security";

type CandidateCV = { id: string; fileName: string; storagePath: string; uploadedAt: string };
type CandidateProfileData = {
  fullName: string;
  email: string;
  address?: string | null;
  occupation?: string | null;
  birthDate?: string | null;
  profileImageUrl?: string | null;
  cvs: CandidateCV[];
} | null;
type EmployerProfileData = {
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
} | null;

type Props = {
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN";
  email: string;
  displayName: string;
  profileImageUrl?: string | null;
  candidateProfile: CandidateProfileData;
  employerProfile: EmployerProfileData;
};

export default function ProfilePageClient({ role, email, displayName, profileImageUrl, candidateProfile, employerProfile }: Props) {
  const t = useTranslations("Profile");
  const [tab, setTab] = useState<Tab>("profile");

  const isEmployer = role === "EMPLOYER";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: t("tabProfile"), icon: isEmployer ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" /> },
    { id: "security", label: t("tabSecurity"), icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToDashboard")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* ── Left Sidebar ── */}
        <aside className="flex flex-col gap-5">
          {/* Identity card */}
          <div className="rounded-2xl border border-border-card bg-white dark:bg-card-background p-6 flex flex-col items-center text-center shadow-sm">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-card-active border border-slate-200 dark:border-white/5 overflow-hidden mb-4 flex items-center justify-center">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
              ) : isEmployer ? (
                <Building2 className="h-9 w-9 text-slate-300 dark:text-foreground/20" />
              ) : (
                <User className="h-9 w-9 text-slate-300 dark:text-foreground/20" />
              )}
            </div>
            <h2 className="text-base font-bold text-foreground leading-tight mb-0.5">{displayName}</h2>
            <p className="text-xs text-foreground/50 break-all">{email}</p>
            <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-navy-primary/10 text-navy-primary dark:bg-navy-primary/20 dark:text-navy-accent">
              {isEmployer ? t("roleEmployer") : t("roleCandidate")}
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="rounded-2xl border border-border-card bg-white dark:bg-card-background p-2 shadow-sm flex flex-col gap-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  tab === item.id
                    ? "bg-navy-primary text-white shadow-sm"
                    : "text-foreground/70 hover:bg-slate-50 dark:hover:bg-card-active hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <div className="rounded-2xl border border-border-card bg-white dark:bg-card-background shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-8 py-6 border-b border-border-card">
            <h1 className="text-xl font-bold text-foreground">
              {tab === "profile" ? t("tabProfile") : t("tabSecurity")}
            </h1>
            <p className="text-sm text-foreground/50 mt-0.5">
              {tab === "profile"
                ? isEmployer ? t("profileDescEmployer") : t("profileDescCandidate")
                : t("securityDesc")}
            </p>
          </div>

          <div className="px-8 py-8">
            {tab === "profile" ? (
              isEmployer ? (
                <EmployerProfileFormInner profile={employerProfile} />
              ) : (
                <CandidateProfileFormInner profile={candidateProfile} email={email} />
              )
            ) : (
              <ChangePasswordForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Thin wrappers to strip the back-link from the original forms */
function CandidateProfileFormInner({ profile, email }: { profile: CandidateProfileData; email: string }) {
  return <CandidateProfileForm profile={profile} userEmail={email} hideBackLink />;
}

function EmployerProfileFormInner({ profile }: { profile: EmployerProfileData }) {
  return <EmployerProfileForm profile={profile} hideBackLink />;
}
