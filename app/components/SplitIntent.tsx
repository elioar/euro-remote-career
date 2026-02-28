import Link from "next/link";

const jobSeekersBullets = [
  "Curated high-quality roles",
  "100% Remote & Async-friendly",
  "Apply directly on the company site",
];

const employersBullets = [
  "Reach async-ready professionals",
  "Premium curated exposure",
  "No spam traffic",
];

export function SplitIntent() {
  return (
    <section className="border-b border-gray-100 bg-white py-12 sm:py-16 lg:py-20 dark:border-slate-700 dark:bg-background">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/jobs"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 dark:border-slate-600 dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold text-[#0E1A2B] sm:text-xl dark:text-slate-100">
              Looking for Remote & Async Work?
            </h2>
            <ul className="mt-4 space-y-2">
              {jobSeekersBullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 shrink-0 text-[#0E1A2B] dark:text-slate-100" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-navy-hover">
              Browse Jobs
              <ArrowIcon className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/jobs"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 dark:border-slate-600 dark:bg-slate-800"
          >
            <h2 className="text-lg font-semibold text-[#0E1A2B] sm:text-xl dark:text-slate-100">
              Hiring Remote-First Talent?
            </h2>
            <ul className="mt-4 space-y-2">
              {employersBullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <CheckIcon className="h-4 w-4 shrink-0 text-[#0E1A2B] dark:text-slate-100" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-navy-hover">
              Post a Job
              <ArrowIcon className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
