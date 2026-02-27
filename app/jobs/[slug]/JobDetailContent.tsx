"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DemoJob } from "../../../lib/demo-jobs";

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeCubic } },
};

function CompanyLogoImage({
  src,
  company,
  className,
}: {
  src: string;
  company: string;
  className: string;
}) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <Image
      src={src}
      alt={`${company} logo`}
      width={40}
      height={40}
      sizes="40px"
      className={className}
      onError={() => {
        setIsVisible(false);
      }}
    />
  );
}

function ApplyCard({ job }: { job: DemoJob }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: easeCubic }}
      className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-[90px] lg:w-80 lg:self-start"
      aria-label="Apply"
    >
      {job.companyLogo ? (
        <div className="mb-3 flex justify-center">
          <CompanyLogoImage
            src={job.companyLogo}
            company={job.company}
            className="h-10 w-10 rounded-full border border-slate-100 bg-white object-contain"
          />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-[#0E1A2B]">
        Apply on company site 🚀
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        You&apos;ll be redirected to the official company site to apply. No spam — straight to the source.
      </p>
      <motion.a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-lg bg-navy-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Apply Now →
      </motion.a>
      <Link
        href="/jobs"
        className="mt-3 flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        ← Back to Jobs
      </Link>
      <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Company</dt>
          <dd className="font-medium text-slate-800">{job.company}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Category</dt>
          <dd className="font-medium text-slate-800">{job.category}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Remote</dt>
          <dd className="font-medium text-slate-800">{job.location}</dd>
        </div>
        {job.async && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Async-friendly</dt>
            <dd className="font-medium text-slate-800">Yes ✓</dd>
          </div>
        )}
        {job.salary && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Salary</dt>
            <dd className="font-medium text-slate-800">{job.salary}</dd>
          </div>
        )}
      </dl>
    </motion.aside>
  );
}

function DescriptionBlock({
  title,
  content,
  delay = 0,
}: {
  title: string;
  content: string;
  delay?: number;
}) {
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <motion.section
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: easeCubic }}
    >
      <h2 className="text-lg font-semibold text-[#0E1A2B]">{title}</h2>
      <div className="mt-3 max-w-prose space-y-4 text-slate-700 leading-relaxed">
        {paragraphs.map((p, i) => {
          if (p.startsWith("- ") || p.startsWith("* ")) {
            const items = p
              .split(/\n/)
              .map((line) => line.replace(/^[-*]\s*/, "").trim())
              .filter(Boolean);
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{p}</p>;
        })}
      </div>
    </motion.section>
  );
}

type JobDetailContentProps = { job: DemoJob };

export function JobDetailContent({ job }: JobDetailContentProps) {
  return (
    <>
      <motion.nav
        aria-label="Breadcrumb"
        className="text-sm text-slate-600"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeCubic }}
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li>
            <Link
              href="/"
              className="text-navy-primary hover:text-navy-hover"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/jobs"
              className="text-navy-primary hover:text-navy-hover"
            >
              Jobs
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-[200px] truncate font-medium text-slate-800 sm:max-w-none">
            {job.title}
          </li>
        </ol>
      </motion.nav>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          <motion.h1
            className="text-2xl font-semibold tracking-tight text-[#0E1A2B] sm:text-3xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
          >
            {job.title}
          </motion.h1>
          <motion.div
            className="mt-2 flex items-center gap-3"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            {job.companyLogo ? (
              <CompanyLogoImage
                src={job.companyLogo}
                company={job.company}
                className="h-10 w-10 shrink-0 rounded border border-slate-100 bg-white object-contain"
              />
            ) : null}
            <span className="text-lg text-slate-600">{job.company}</span>
          </motion.div>

          <motion.div
            className="mt-4 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease: easeCubic }}
          >
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              🌍 Remote
            </span>
            {job.async && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                ⏰ Async-friendly
              </span>
            )}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {job.category}
            </span>
            {job.timezone && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {job.timezone}
              </span>
            )}
            {job.seniority && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {job.seniority}
              </span>
            )}
          </motion.div>

          <motion.dl
            className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: easeCubic }}
          >
            <div>
              <dt className="sr-only">Location</dt>
              <dd>📍 {job.location}</dd>
            </div>
            {job.salary && (
              <div>
                <dt className="sr-only">Salary</dt>
                <dd>💰 {job.salary}</dd>
              </div>
            )}
            {job.datePosted && (
              <div>
                <dt className="sr-only">Posted</dt>
                <dd>
                  📅{" "}
                  {new Date(job.datePosted).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            )}
          </motion.dl>

          <div className="mt-6 lg:hidden">
            <ApplyCard job={job} />
          </div>

          <DescriptionBlock
            title="✨ About the role"
            content={job.description}
            delay={0.25}
          />
          {job.requirements && (
            <DescriptionBlock
              title="📋 What you'll need"
              content={job.requirements}
              delay={0.35}
            />
          )}
          {job.benefits && (
            <DescriptionBlock
              title="🎁 What you get"
              content={job.benefits}
              delay={0.45}
            />
          )}
        </div>

        <div className="hidden lg:block">
          <ApplyCard job={job} />
        </div>
      </div>
    </>
  );
}
