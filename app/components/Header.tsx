"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[101] bg-transparent pt-3 pb-0 md:z-50 md:border-b md:border-gray-100 md:bg-white md:pt-0 md:pb-0 md:shadow-sm">
      <motion.div
        className="relative z-[102] mx-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-lg md:z-auto md:mx-auto md:max-w-[1100px] md:rounded-none md:border-0 md:shadow-none md:py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal"
        animate={{
          boxShadow: mobileOpen
            ? "0 25px 50px -12px rgb(0 0 0 / 0.2), 0 0 0 1px rgb(0 0 0 / 0.05)"
            : "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-1.5 text-base font-semibold tracking-tight text-navy-primary transition-colors hover:text-navy-hover sm:gap-2 sm:text-lg"
        >
          <LogoIcon className="h-5 w-5 shrink-0 text-navy-primary sm:h-6 sm:w-6" />
          <span className="truncate">Euro Remote Career</span>
        </Link>

        <nav
          className="relative hidden items-center justify-center gap-1 rounded-full bg-slate-100 p-1 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-navy-primary" : "text-navy-primary hover:bg-white/60"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-capsule-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
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
          <Link
            href="/jobs"
            className="hidden text-sm font-medium text-navy-primary transition-colors hover:text-navy-hover md:inline-block"
          >
            Post a Job
          </Link>
          <Link
            href="/jobs"
            className="hidden rounded-full bg-navy-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover md:inline-block"
          >
            Browse Jobs
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy-primary transition-colors hover:bg-gray-100 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
                  <CloseIcon className="h-5 w-5" />
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
                  <MenuIcon className="h-5 w-5" />
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
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            {/* Overlay panel - blue background, white text; starts below fixed header */}
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
              className="absolute inset-0 flex flex-col overflow-auto bg-navy-primary pt-[72px]"
            >
              {/* Main nav - staggered */}
              <motion.nav
                className="flex-1 px-6 py-6"
                aria-label="Mobile navigation"
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
                          className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-white transition-colors ${
                            isActive
                              ? "bg-white/15"
                              : "hover:bg-white/10"
                          }`}
                        >
                          {label}
                          <ChevronIcon className="h-4 w-4 shrink-0 text-white/70" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.nav>

              {/* Secondary links */}
              <motion.div
                className="shrink-0 border-t border-white/20 px-6 py-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Link
                    href="/privacy"
                    onClick={() => setMobileOpen(false)}
                    className="text-white/90 hover:text-white"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setMobileOpen(false)}
                    className="text-white/90 hover:text-white"
                  >
                    Terms
                  </Link>
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div
                className="shrink-0 space-y-2 px-6 pb-8 pt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.28 }}
              >
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Post a Job
                </Link>
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-navy-primary shadow-sm transition-colors hover:bg-white/90"
                >
                  Browse Jobs
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
      <path d="M21 3H3v10h18V3z" />
      <path d="M7 17v-4M12 17v-4M17 17v-4" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
