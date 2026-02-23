"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export function HeroSearch() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value?.trim() || "";
    const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value?.trim() || "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-100 p-1.5 sm:flex-row sm:rounded-full sm:items-center sm:gap-1">
        <label className="relative flex-1 rounded-xl focus-within:bg-white focus-within:shadow-sm sm:rounded-full">
          <span className="sr-only">Job title or company</span>
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="Job Title / Company Name"
            className="w-full rounded-full border-0 bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:py-2.5"
          />
        </label>
        <label className="relative flex-1 rounded-xl focus-within:bg-white focus-within:shadow-sm sm:rounded-full">
          <span className="sr-only">Location</span>
          <LocationIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="w-full rounded-full border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:py-2.5"
          />
          <ChevronIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </label>
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover sm:rounded-full sm:px-5"
          aria-label="Search jobs"
        >
          <SearchIcon className="h-4 w-4 text-white" />
          <span className="sm:hidden">Search</span>
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

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
