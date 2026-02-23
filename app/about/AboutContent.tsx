"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeCubic },
  },
};

export function AboutContent() {
  return (
    <>
      {/* 1) Hero */}
      <motion.section
        className="mb-16 sm:mb-20"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-[#0E1A2B] sm:text-4xl">
          About Euro Remote Career
        </h1>
        <motion.p
          className="mt-4 text-lg text-slate-600 sm:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: easeCubic }}
        >
          A curated platform for high-quality remote & async-friendly roles.
        </motion.p>
        <motion.p
          className="mt-2 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          We focus on quality over quantity. No spam listings.
        </motion.p>
      </motion.section>

      {/* 2) Mission / Why We Exist */}
      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="mission-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div variants={fadeUp} custom={0}>
            <h2 id="mission-heading" className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
              Our Mission
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We help professionals find truly remote and async-friendly jobs with a clean,
              distraction-free experience. Every listing is manually reviewed before
              publishing. We take an SEO-first approach so great roles are easy to
              discover—and you apply on the official company site, never through us.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h2 className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
              What Makes Us Different
            </h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              {[
                "Curated listings—manual review before any job goes live",
                "Remote-only and async-friendly focus",
                "Apply on the company site—we link to the official source",
                "Clean, minimal experience—no clutter",
              ].map((text) => (
                <motion.li
                  key={text}
                  className="flex gap-3"
                  variants={fadeUp}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-primary" aria-hidden />
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* 3) How It Works */}
      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="how-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.h2 id="how-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
          How It Works
        </motion.h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {[
            { step: "Step 1", title: "Discover curated roles", desc: "Browse vetted remote and async-friendly jobs." },
            { step: "Step 2", title: "Read job details", desc: "Review the full description and requirements." },
            { step: "Step 3", title: "Apply on the official company site", desc: "You're redirected to the employer's site to apply." },
          ].map((item) => (
            <motion.li
              key={item.step}
              className="border-l-2 border-navy-primary pl-5"
              variants={fadeUp}
            >
              <span className="text-sm font-medium text-navy-primary">{item.step}</span>
              <p className="mt-1 font-medium text-[#0E1A2B]">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </motion.li>
          ))}
        </ol>
        <motion.p
          className="mt-6 text-sm text-slate-500"
          variants={fadeUp}
        >
          Employers submit roles → Admin review → Published.
        </motion.p>
      </motion.section>

      {/* 4) For Employers */}
      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="employers-heading"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="employers-heading" className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
            For Employers
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Get your roles in front of an audience that cares about remote and
            async work. We focus on quality exposure—no spam traffic. Our
            visitors are professionals looking for serious opportunities.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center rounded-lg bg-navy-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
            >
              Contact Us
            </Link>
          </motion.div>
          <p className="mt-4 text-sm text-slate-500">
            Paid posts and featured listings are planned in later phases.
          </p>
        </div>
      </motion.section>

      {/* 5) Trust / Quality Guidelines */}
      <motion.section
        className="mb-16 rounded-2xl bg-section-muted p-6 sm:mb-20 sm:p-8"
        aria-labelledby="quality-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.h2 id="quality-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
          Our Quality Bar
        </motion.h2>
        <ul className="mt-6 space-y-3 text-slate-700">
          {[
            "Remote-only—no hybrid or \"remote sometimes\" without clarity",
            "Async-friendly culture preferred",
            "Clear, honest job descriptions",
            "No duplicates or low-quality posts",
            "Manual approval before publish",
          ].map((text) => (
            <motion.li
              key={text}
              className="flex gap-3"
              variants={fadeUp}
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E1A2B]" aria-hidden />
              <span>{text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* 6) FAQ */}
      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="faq-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.h2 id="faq-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] sm:text-2xl">
          Frequently Asked Questions
        </motion.h2>
        <dl className="mt-6 space-y-6">
          {[
            { q: "Do you collect CVs?", a: "No, not in Phase 1. You apply on the company's site." },
            { q: "Where do I apply?", a: "On the official company site. We link to their apply page; we don't host applications." },
            { q: "How are jobs selected?", a: "Manual review and quality checks. We only publish roles that meet our quality bar." },
            { q: "Can employers post jobs?", a: "Yes, via submission. Phase 3 will add a full employer flow." },
            { q: "Is everything really remote?", a: "We list remote-only roles. Hybrid roles are only included when clearly described." },
          ].map((faq) => (
            <motion.div key={faq.q} variants={fadeUp}>
              <dt className="font-medium text-[#0E1A2B]">{faq.q}</dt>
              <dd className="mt-1 text-slate-600">{faq.a}</dd>
            </motion.div>
          ))}
        </dl>
      </motion.section>

      {/* 7) Footer CTA */}
      <motion.section
        className="rounded-2xl border border-slate-200 bg-white py-10 text-center shadow-sm sm:py-12"
        aria-labelledby="cta-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <h2 id="cta-heading" className="text-lg font-semibold text-[#0E1A2B] sm:text-xl">
          Ready to explore curated remote work?
        </h2>
        <motion.div className="mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-lg bg-navy-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
          >
            Browse Jobs
          </Link>
        </motion.div>
      </motion.section>
    </>
  );
}
