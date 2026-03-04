"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("About");
  const tc = useTranslations("Common");

  const differents = [t("different1"), t("different2"), t("different3"), t("different4")];
  const qualityItems = [t("quality1"), t("quality2"), t("quality3"), t("quality4"), t("quality5")];
  const howSteps = [
    { step: t("howStep1"), title: t("howStep1Title"), desc: t("howStep1Desc") },
    { step: t("howStep2"), title: t("howStep2Title"), desc: t("howStep2Desc") },
    { step: t("howStep3"), title: t("howStep3Title"), desc: t("howStep3Desc") },
  ];
  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
  ];

  return (
    <>
      <motion.section
        className="mb-16 sm:mb-20"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-[#0E1A2B] dark:text-slate-100 sm:text-4xl">
          {t("pageTitle")}
        </h1>
        <motion.p
          className="mt-4 text-lg text-slate-600 sm:text-xl dark:text-slate-300"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: easeCubic }}
        >
          {t("subtitle")}
        </motion.p>
        <motion.p
          className="mt-2 text-sm text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {t("qualityNote")}
        </motion.p>
      </motion.section>

      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="mission-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div variants={fadeUp}>
            <h2 id="mission-heading" className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
              {t("missionTitle")}
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed dark:text-slate-300">
              {t("missionText")}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h2 className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
              {t("differentTitle")}
            </h2>
            <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              {differents.map((text) => (
                <motion.li key={text} className="flex gap-3" variants={fadeUp}>
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-primary dark:bg-blue-400" aria-hidden />
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="how-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.h2 id="how-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
          {t("howTitle")}
        </motion.h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {howSteps.map((item) => (
            <motion.li key={item.step} className="border-l-2 border-navy-primary pl-5 dark:border-blue-400" variants={fadeUp}>
              <span className="text-sm font-medium text-navy-primary dark:text-blue-400">{item.step}</span>
              <p className="mt-1 font-medium text-[#0E1A2B] dark:text-slate-100">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            </motion.li>
          ))}
        </ol>
        <motion.p className="mt-6 text-sm text-slate-500 dark:text-slate-400" variants={fadeUp}>
          {t("howFooter")}
        </motion.p>
      </motion.section>

      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="employers-heading"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-800">
          <h2 id="employers-heading" className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
            {t("employersTitle")}
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed dark:text-slate-300">
            {t("employersText")}
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center rounded-lg bg-navy-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {t("contactUs")}
            </Link>
          </motion.div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t("employersNote")}
          </p>
        </div>
      </motion.section>

      <motion.section
        className="mb-16 rounded-2xl bg-section-muted p-6 sm:mb-20 sm:p-8 dark:border dark:border-slate-700"
        aria-labelledby="quality-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.h2 id="quality-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
          {t("qualityTitle")}
        </motion.h2>
        <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-300">
          {qualityItems.map((text) => (
            <motion.li key={text} className="flex gap-3" variants={fadeUp}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E1A2B] dark:bg-slate-400" aria-hidden />
              <span>{text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="mb-16 sm:mb-20"
        aria-labelledby="faq-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.h2 id="faq-heading" variants={fadeUp} className="text-xl font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-2xl">
          {t("faqTitle")}
        </motion.h2>
        <dl className="mt-6 space-y-6">
          {faqs.map((faq) => (
            <motion.div key={faq.q} variants={fadeUp}>
              <dt className="font-medium text-[#0E1A2B] dark:text-slate-100">{faq.q}</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{faq.a}</dd>
            </motion.div>
          ))}
        </dl>
      </motion.section>

      <motion.section
        className="rounded-2xl border border-slate-200 bg-white py-10 text-center shadow-sm sm:py-12 dark:border-slate-700 dark:bg-slate-800"
        aria-labelledby="cta-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: easeCubic }}
      >
        <h2 id="cta-heading" className="text-lg font-semibold text-[#0E1A2B] dark:text-slate-100 sm:text-xl">
          {t("ctaTitle")}
        </h2>
        <motion.div className="mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-lg bg-navy-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {tc("browseJobs")}
          </Link>
        </motion.div>
      </motion.section>
    </>
  );
}
