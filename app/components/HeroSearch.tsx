"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function HeroSearch() {
  const router = useRouter();
  const t = useTranslations("HeroSearch");
  const formRef = useRef<HTMLFormElement>(null);
  const [location, setLocation] = useState("");
  const [jobsBase, setJobsBase] = useState("/jobs");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const role = (user.user_metadata?.role as string) ?? "CANDIDATE";
      if (role !== "EMPLOYER") setJobsBase("/dashboard");
    });
  }, []);

  const LOCATIONS = [
    { value: "", label: t("allLocations") },
    { value: "athens", label: t("athens") },
    { value: "thessaloniki", label: t("thessaloniki") },
    { value: "abroad", label: t("abroad") },
  ] as const;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value?.trim() || "";
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (location) params.set("location", location);
    router.push(`${jobsBase}?${params.toString()}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.value || "all"}
            type="button"
            onClick={() => setLocation(loc.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              location === loc.value
                ? "bg-navy-primary text-white hover:bg-navy-hover"
                : "border border-border-muted bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-border-muted dark:bg-card-background dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-card-active"
            } ${loc.value === "abroad" ? "hidden sm:inline-flex" : ""}`}
          >
            {loc.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-50 p-1.5 sm:flex-row sm:rounded-full sm:items-center sm:gap-1 dark:bg-section-muted border border-border-muted dark:border-border-muted">
        <label className="relative flex-1 rounded-xl focus-within:bg-white focus-within:shadow-sm sm:rounded-full dark:focus-within:bg-card-active">
          <span className="sr-only">{t("srLabel")}</span>
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
          <input
            type="search"
            name="q"
            placeholder={t("placeholder")}
            className="w-full rounded-full border-0 bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:py-2.5 dark:placeholder:text-foreground/50"
          />
        </label>
        <input type="hidden" name="location" value={location} readOnly />
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover sm:rounded-full sm:px-5"
          aria-label={t("searchJobs")}
        >
          <SearchIcon className="h-4 w-4 text-white" />
          <span>{t("search")}</span>
        </button>
      </div>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
