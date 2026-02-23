"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const LOCATIONS = [
  { value: "", label: "All locations" },
  { value: "athens", label: "Athens" },
  { value: "thessaloniki", label: "Thessaloniki" },
  { value: "abroad", label: "Abroad" },
] as const;

export function HeroSearch() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value?.trim() || "";
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
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
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            } ${loc.value === "abroad" ? "hidden sm:inline-flex" : ""}`}
          >
            {loc.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-100 p-1.5 sm:flex-row sm:rounded-full sm:items-center sm:gap-1">
        <label className="relative flex-1 rounded-xl focus-within:bg-white focus-within:shadow-sm sm:rounded-full">
          <span className="sr-only">Job title or company</span>
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="e.g. Engineer, Designer"
            className="w-full rounded-full border-0 bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:py-2.5"
          />
        </label>
        <input type="hidden" name="location" value={location} readOnly />
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover sm:rounded-full sm:px-5"
          aria-label="Search jobs"
        >
          <SearchIcon className="h-4 w-4 text-white" />
          <span>Search</span>
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
