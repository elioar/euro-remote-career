"use client";

import { motion } from "framer-motion";

export function CompanyLogos() {
  const placeholderCount = 5;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-gray-100 bg-section-muted py-8 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x snap-mandatory flex-nowrap items-center justify-start gap-6 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:gap-8 sm:pb-0 lg:gap-16">
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-10 w-20 shrink-0 snap-center items-center justify-center rounded-lg border border-gray-200 bg-gray-50 grayscale opacity-70 sm:h-12 sm:w-24"
              aria-hidden
            >
              <span className="text-xs font-medium text-gray-400">Logo {i + 1}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
