"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroSearch } from "./HeroSearch";
import { HeroSpline } from "./HeroSpline";

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
              <span className="block">
                {"Find a Dream Job".split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordItem}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block mr-[0.25em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                <motion.span
                  variants={wordItem}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.25em]"
                >
                  With
                </motion.span>
                <motion.span
                  variants={wordItem}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative inline-block text-navy-primary"
                >
                  <span className="relative z-10">Euro Remote</span>
                  <motion.span
                    className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                  />
                </motion.span>
              </span>
              <span className="block">
                <motion.span
                  variants={wordItem}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative inline-block text-navy-primary"
                >
                  <span className="relative z-10">Career</span>
                </motion.span>
              </span>
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
            className="relative w-full min-h-[240px] sm:min-h-[280px] lg:min-h-[320px]"
          >
            <HeroSpline />
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
