"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const COMPANIES = [
  { name: "GitLab", domain: "gitlab.com" },
  { name: "Automattic", domain: "automattic.com" },
  { name: "Buffer", domain: "buffer.com" },
  { name: "Zapier", domain: "zapier.com" },
  { name: "Shopify", domain: "shopify.com" },
] as const;

function CompanyLogo({ name, domain, index }: { name: string; domain: string; index: number }) {
  const [error, setError] = useState(false);
  const src = `https://logo.clearbit.com/${domain}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-10 w-20 shrink-0 snap-center items-center justify-center rounded-lg border border-gray-200 bg-white px-2 sm:h-12 sm:w-24 dark:border-slate-600 dark:bg-slate-700/80"
      aria-hidden
    >
      {error ? (
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate px-1">{name}</span>
      ) : (
        <Image
          src={src}
          alt=""
          width={96}
          height={48}
          className="h-6 w-auto max-w-[80px] object-contain object-center grayscale opacity-80 dark:opacity-90 dark:brightness-0 dark:invert"
          onError={() => setError(true)}
          unoptimized
        />
      )}
    </motion.div>
  );
}

export function CompanyLogos() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-gray-100 bg-section-muted py-8 sm:py-12 lg:py-16 dark:border-slate-700"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x snap-mandatory flex-nowrap items-center justify-start gap-6 overflow-x-auto pb-2 sm:flex-wrap sm:justify-between sm:gap-8 sm:pb-0 lg:gap-12">
          {COMPANIES.map((company, i) => (
            <CompanyLogo key={company.domain} name={company.name} domain={company.domain} index={i} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
