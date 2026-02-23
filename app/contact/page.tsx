"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.header
          className="mb-12 sm:mb-16"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="text-3xl font-semibold tracking-tight text-[#0E1A2B] sm:text-4xl"
          >
            Get in touch
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-3 text-lg text-slate-600"
          >
            Have a question or want to list a role? We&apos;re here to help.
          </motion.p>
        </motion.header>

        <motion.div
          className="grid gap-8 lg:grid-cols-2 lg:gap-12"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.section
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            aria-labelledby="contact-options"
          >
            <h2 id="contact-options" className="text-lg font-semibold text-[#0E1A2B]">
              Contact options
            </h2>
            <ul className="mt-6 space-y-6">
              <li>
                <span className="text-sm font-medium text-slate-500">General & jobs</span>
                <motion.a
                  href="mailto:hello@euroremotecareer.com"
                  className="mt-1 block text-navy-primary hover:text-navy-hover"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  hello@euroremotecareer.com
                </motion.a>
                <p className="mt-1 text-sm text-slate-600">
                  For job seekers, feedback, or general enquiries.
                </p>
              </li>
              <li>
                <span className="text-sm font-medium text-slate-500">Employers</span>
                <motion.a
                  href="mailto:employers@euroremotecareer.com"
                  className="mt-1 block text-navy-primary hover:text-navy-hover"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  employers@euroremotecareer.com
                </motion.a>
                <p className="mt-1 text-sm text-slate-600">
                  To submit a role or ask about listing with us.
                </p>
              </li>
            </ul>
            <p className="mt-6 text-sm text-slate-500">
              We aim to reply within 1–2 business days.
            </p>
          </motion.section>

          <motion.section
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-section-muted p-6 sm:p-8 transition-shadow hover:shadow-md"
            aria-labelledby="quick-links"
          >
            <h2 id="quick-links" className="text-lg font-semibold text-[#0E1A2B]">
              Quick links
            </h2>
            <ul className="mt-6 space-y-4">
              <li>
                <motion.div whileHover={{ x: 4 }}>
                  <Link
                    href="/about"
                    className="text-navy-primary hover:text-navy-hover inline-block"
                  >
                    About us →
                  </Link>
                </motion.div>
                <p className="mt-0.5 text-sm text-slate-600">Mission, how it works, FAQ.</p>
              </li>
              <li>
                <motion.div whileHover={{ x: 4 }}>
                  <Link
                    href="/jobs"
                    className="text-navy-primary hover:text-navy-hover inline-block"
                  >
                    Browse jobs →
                  </Link>
                </motion.div>
                <p className="mt-0.5 text-sm text-slate-600">Curated remote & async roles.</p>
              </li>
              <li>
                <motion.div whileHover={{ x: 4 }}>
                  <Link
                    href="/privacy"
                    className="text-navy-primary hover:text-navy-hover inline-block"
                  >
                    Privacy →
                  </Link>
                </motion.div>
                <p className="mt-0.5 text-sm text-slate-600">How we handle your data.</p>
              </li>
            </ul>
          </motion.section>
        </motion.div>

        <motion.div
          className="mt-12 text-center sm:mt-16"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-lg bg-navy-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
            >
              Browse jobs
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
