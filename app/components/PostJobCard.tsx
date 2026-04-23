"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { RoleBlockModal } from "./RoleBlockModal";

type Props = {
  title: string;
  bullets: string[];
  buttonLabel: string;
  isCandidate: boolean;
};

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

export function PostJobCard({ title, bullets, buttonLabel, isCandidate }: Props) {
  const [showModal, setShowModal] = useState(false);

  const cardClass =
    "group flex flex-col rounded-2xl border border-border-card bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 dark:border-border-card dark:bg-card-background hover:dark:bg-card-active hover:dark:border-white/20 cursor-pointer text-left w-full";

  const inner = (
    <>
      <h2 className="text-lg font-semibold text-[#0E1A2B] sm:text-xl dark:text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2">
        {bullets.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-foreground/70">
            <CheckIcon className="h-4 w-4 shrink-0 text-[#0E1A2B] dark:text-foreground/80" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-navy-hover">
        {buttonLabel}
        <ArrowIcon className="h-4 w-4" />
      </span>
    </>
  );

  if (!isCandidate) {
    return (
      <Link href="/dashboard/post-job" className={cardClass}>
        {inner}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)} className={cardClass}>
        {inner}
      </button>
      <RoleBlockModal open={showModal} onClose={() => setShowModal(false)} variant="candidateCannotPost" />
    </>
  );
}
