"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroSearch } from "./HeroSearch";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const wordStagger = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};
const wordItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <motion.section
      className="bg-white"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20 xl:py-24">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-14 lg:items-center">
          <motion.div className="space-y-4 sm:space-y-6" variants={stagger}>
            <motion.h1
              className="max-w-[520px] text-2xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-3xl sm:leading-[1.05] md:text-4xl lg:text-[56px]"
              variants={wordStagger}
              initial="initial"
              animate="animate"
            >
              {"Find a Dream Job With ".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordItem}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                variants={wordItem}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block text-navy-primary"
              >
                <span className="relative z-10">Euro Remote Career</span>
                <motion.span
                  className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                />
              </motion.span>
            </motion.h1>
            <motion.div variants={fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <HeroSearch />
            </motion.div>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[480px] text-sm leading-relaxed text-gray-600 sm:text-base"
            >
              Discover thousands of opportunities tailored to your skills. Apply with ease,
              track your progress, and take the next step in your career—all in one place.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3 pt-1 sm:gap-4"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/jobs"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-primary px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-hover sm:w-auto"
                >
                  Browse Jobs
                  <motion.span initial={false} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <ArrowRightIcon className="h-4 w-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <TrustAvatars />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[4/3] min-h-[240px] overflow-hidden rounded-2xl shadow-lg bg-gray-100 sm:min-h-[280px] sm:rounded-3xl lg:min-h-[320px]"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE_URL}
                alt="Calm remote work setup at home"
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -6, 0],
              }}
              transition={{
                opacity: { duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
                x: { duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              }}
              className="absolute right-[2%] top-[6%] w-[calc(100%-1rem)] max-w-[260px] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg sm:right-[4%] sm:top-[8%] sm:max-w-[280px] sm:rounded-2xl sm:p-5"
            >
              <h3 className="text-[#0E1A2B] text-sm font-semibold leading-snug sm:text-base">Senior Product Designer</h3>
              <p className="mt-1 text-xs text-[#0E1A2B]/80 sm:text-sm">Remote Team</p>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#0E1A2B]">Remote</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#0E1A2B]">Async-friendly</span>
              </div>
              <p className="mt-2 text-xs text-[#0E1A2B]/70 sm:mt-3">€70k–€95k</p>
              <a href="/jobs" className="mt-1.5 inline-block text-xs font-medium text-[#0E1A2B] hover:underline sm:mt-2">Apply on company site →</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, 5, 0],
              }}
              transition={{
                opacity: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
                x: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
                y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.3 },
              }}
              className="absolute bottom-[6%] left-[2%] w-[calc(100%-1rem)] max-w-[240px] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg sm:max-w-[260px] sm:rounded-2xl sm:p-5 lg:bottom-[10%]"
            >
              <h3 className="text-[#0E1A2B] text-sm font-semibold leading-snug sm:text-base">Curated & Reviewed</h3>
              <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                <li className="flex items-center gap-2 text-xs text-[#0E1A2B] sm:text-sm">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E1A2B] sm:h-4 sm:w-4" />
                  <span>Manually reviewed</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-[#0E1A2B] sm:text-sm">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E1A2B] sm:h-4 sm:w-4" />
                  <span>Remote-only</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-[#0E1A2B] sm:text-sm">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E1A2B] sm:h-4 sm:w-4" />
                  <span>No spam listings</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function TrustAvatars() {
  return (
    <div className="flex -space-x-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 shadow-sm"
          aria-hidden
        >
          {i}
        </motion.div>
      ))}
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
