import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6 sm:pt-8">
          <nav
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            aria-label="Footer navigation"
          >
            <Link
              href="/about"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover"
            >
              Contact
            </Link>
          </nav>
          <p className="text-sm text-gray-500">
            © {currentYear} Euro Remote Career
          </p>
        </div>
      </div>
    </footer>
  );
}
