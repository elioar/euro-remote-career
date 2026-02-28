import { Suspense } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { JobsPageContent } from "./JobsPageContent";

function JobsPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
        </div>
        <div className="mb-6 h-10 w-full max-w-md animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="grid gap-4 sm:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageFallback />}>
      <JobsPageContent />
    </Suspense>
  );
}
