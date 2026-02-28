import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6 sm:pt-8 dark:border-slate-700">
          <nav
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            aria-label="Footer navigation"
          >
            <Link
              href="/about"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-slate-400 dark:hover:text-navy-primary"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-slate-400 dark:hover:text-navy-primary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-slate-400 dark:hover:text-navy-primary"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-slate-400 dark:hover:text-navy-primary"
            >
              Contact
            </Link>
          </nav>
          <p className="text-sm text-gray-500 dark:text-slate-500">
            © {currentYear} Euro Remote Career
          </p>
        </div>
      </div>
    </footer>
  );
}
