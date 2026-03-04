"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("Header");
  const tc = useTranslations("Common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/jobs" as const, label: t("jobs") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMobile(!mq.matches);
    const fn = () => setIsMobile(!mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[101] bg-transparent pt-3 pb-0 md:z-50 md:border-b md:border-gray-100 md:bg-background md:pt-0 md:pb-0 dark:md:border-slate-700">
      <motion.div
        className="relative z-[102] mx-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-background px-4 py-3 shadow-lg md:z-auto md:mx-auto md:max-w-[1100px] md:rounded-none md:border-0 md:shadow-none md:py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal dark:border-slate-700"
        animate={{
          boxShadow: isMobile
            ? mobileOpen
              ? "0 25px 50px -12px rgb(0 0 0 / 0.2), 0 0 0 1px rgb(0 0 0 / 0.05)"
              : "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)"
            : "none",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-1.5 text-base font-semibold tracking-tight text-navy-primary transition-colors hover:text-navy-hover dark:text-white dark:hover:text-slate-200 sm:gap-2 sm:text-lg"
        >
          <LogoIcon className="h-5 w-5 shrink-0 text-navy-primary dark:text-white sm:h-6 sm:w-6" />
          <span className="truncate">Euro Remote Career</span>
        </Link>

        <nav
          className="relative hidden items-center justify-center gap-1 rounded-full bg-slate-100 p-1 md:flex dark:bg-slate-700"
          aria-label={t("mainNav")}
        >
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-navy-primary dark:text-blue-300" : "text-navy-primary hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-capsule-pill"
                    className="absolute inset-0 rounded-full bg-slate-100 shadow-sm dark:bg-slate-500"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                    }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/jobs"
            className="hidden text-sm font-medium text-navy-primary transition-colors hover:text-navy-hover md:inline-block dark:text-blue-300 dark:hover:text-blue-200"
          >
            {tc("postAJob")}
          </Link>
          <Link
            href="/jobs"
            className="hidden rounded-full bg-navy-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover md:inline-block"
          >
            {tc("browseJobs")}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy-primary transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-slate-700"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute"
                >
                  <CloseIcon className="h-5 w-5 dark:text-white" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute"
                >
                  <MenuIcon className="h-5 w-5 dark:text-white" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[100] md:hidden"
            aria-hidden={!mobileOpen}
          >
            <motion.button
              type="button"
              aria-label={t("closeMenu")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
                mass: 0.9,
              }}
              className="absolute inset-0 flex flex-col overflow-auto bg-white pt-[72px] dark:bg-slate-900"
            >
              <motion.nav
                className="flex-1 px-6 py-6"
                aria-label={t("mobileNav")}
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
                  },
                  hidden: {},
                }}
              >
                <ul className="space-y-1">
                  {navLinks.map(({ href, label }) => {
                    const isActive = pathname === href;
                    return (
                      <motion.li
                        key={href}
                        variants={{
                          visible: { opacity: 1, y: 0 },
                          hidden: { opacity: 0, y: 8 },
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                            isActive
                              ? "bg-navy-primary/10 text-navy-primary dark:bg-slate-700 dark:text-white"
                              : "text-navy-primary hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                          }`}
                        >
                          {label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.nav>

              <motion.div
                className="shrink-0 border-t border-slate-200 px-6 py-4 dark:border-slate-700"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Link
                    href="/privacy"
                    onClick={() => setMobileOpen(false)}
                    className="text-navy-primary hover:text-navy-hover dark:text-slate-300 dark:hover:text-white"
                  >
                    {t("privacy")}
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setMobileOpen(false)}
                    className="text-navy-primary hover:text-navy-hover dark:text-slate-300 dark:hover:text-white"
                  >
                    {t("terms")}
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="shrink-0 space-y-2 px-6 pb-8 pt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.28 }}
              >
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-navy-primary bg-transparent px-4 py-3 text-sm font-medium text-navy-primary transition-colors hover:bg-slate-50 dark:border-slate-500 dark:text-white dark:hover:bg-slate-800"
                >
                  {tc("postAJob")}
                </Link>
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-hover dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {tc("browseJobs")}
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      {/* Briefcase body — solid fill */}
      <rect fill="currentColor" x="2" y="11" width="20" height="11" rx="2.5" />
      {/* Handle — solid fill, overlaps body top */}
      <rect fill="currentColor" x="9.5" y="8" width="5" height="4" rx="1.5" />
      {/* Wifi outer arc */}
      <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M6.5 5.5Q12 0.5 17.5 5.5" />
      {/* Wifi inner arc */}
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 4Q12 1.5 15 4" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
