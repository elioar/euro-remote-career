"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm"
    >
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-1.5 text-base font-semibold tracking-tight text-navy-primary transition-colors hover:text-navy-hover sm:gap-2 sm:text-lg"
        >
          <LogoIcon className="h-5 w-5 shrink-0 text-navy-primary sm:h-6 sm:w-6" />
          <span className="truncate">Euro Remote Career</span>
        </Link>

        <div className="hidden items-center justify-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-navy-primary shadow-sm"
                    : "text-navy-primary hover:bg-white/60"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

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
            className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-primary transition-colors hover:bg-gray-100 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
            aria-hidden={!mobileOpen}
          >
            <nav className="flex flex-col px-4 py-4" aria-label="Mobile navigation">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-200 text-navy-primary"
                        : "text-navy-primary hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-center text-sm font-medium text-navy-primary transition-colors hover:bg-gray-100"
                >
                  Post a Job
                </Link>
                <Link
                  href="/jobs"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-navy-primary px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-navy-hover"
                >
                  Browse Jobs
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
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
