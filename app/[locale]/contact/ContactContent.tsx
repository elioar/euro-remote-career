"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

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

export function ContactContent() {
  const t = useTranslations("Contact");
  const tc = useTranslations("Common");

  return (
    <>
      <motion.header
        className="mb-12 sm:mb-16"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl dark:text-foreground"
        >
          {t("pageTitle")}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="mt-3 text-lg text-slate-600 dark:text-foreground/70"
        >
          {t("subtitle")}
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
          className="rounded-2xl border border-border-card bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 dark:border-border-card dark:bg-card-background"
          aria-labelledby="contact-options"
        >
          <h2 id="contact-options" className="text-lg font-semibold text-foreground dark:text-foreground">
            {t("contactOptions")}
          </h2>
          <ul className="mt-6 space-y-6">
            <li>
              <span className="text-sm font-medium text-slate-500 dark:text-foreground/50">{t("generalLabel")}</span>
              <motion.a
                href="mailto:hello@euroremotecareer.com"
                className="mt-1 block text-navy-primary hover:text-navy-hover dark:text-navy-accent dark:hover:text-navy-accent/80"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                hello@euroremotecareer.com
              </motion.a>
              <p className="mt-1 text-sm text-slate-600 dark:text-foreground/60">
                {t("generalDesc")}
              </p>
            </li>
            <li>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("employersLabel")}</span>
              <motion.a
                href="mailto:employers@euroremotecareer.com"
                className="mt-1 block text-navy-primary hover:text-navy-hover dark:text-navy-accent dark:hover:text-navy-accent/80"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                employers@euroremotecareer.com
              </motion.a>
              <p className="mt-1 text-sm text-slate-600 dark:text-foreground/60">
                {t("employersDesc")}
              </p>
            </li>
          </ul>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {t("replyTime")}
          </p>
        </motion.section>

        <motion.section
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl bg-section-muted p-6 sm:p-8 transition-shadow hover:shadow-md dark:border dark:border-border-muted"
          aria-labelledby="quick-links"
        >
          <h2 id="quick-links" className="text-lg font-semibold text-foreground dark:text-foreground">
            {t("quickLinks")}
          </h2>
          <ul className="mt-6 space-y-4">
            <li>
              <motion.div whileHover={{ x: 4 }}>
                <Link href="/about" className="text-navy-primary hover:text-navy-hover inline-block dark:text-navy-accent dark:hover:text-navy-accent/80">
                  {t("aboutLink")}
                </Link>
              </motion.div>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{t("aboutDesc")}</p>
            </li>
            <li>
              <motion.div whileHover={{ x: 4 }}>
                <Link href="/jobs" className="text-navy-primary hover:text-navy-hover inline-block dark:text-navy-accent dark:hover:text-navy-accent/80">
                  {t("browseLink")}
                </Link>
              </motion.div>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{t("browseDesc")}</p>
            </li>
            <li>
              <motion.div whileHover={{ x: 4 }}>
                <Link href="/privacy" className="text-navy-primary hover:text-navy-hover inline-block dark:text-navy-accent dark:hover:text-navy-accent/80">
                  {t("privacyLink")}
                </Link>
              </motion.div>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-foreground/60">{t("privacyDesc")}</p>
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
            {tc("browseJobs")}
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}
