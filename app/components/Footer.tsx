import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6 sm:pt-8 dark:border-border-muted">
          <nav
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            aria-label={t("footerNav")}
          >
            <Link
              href="/about"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-foreground/70 dark:hover:text-navy-accent"
            >
              {t("about")}
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-foreground/70 dark:hover:text-navy-accent"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-foreground/70 dark:hover:text-navy-accent"
            >
              {t("terms")}
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 transition-colors hover:text-navy-hover dark:text-foreground/70 dark:hover:text-navy-accent"
            >
              {t("contact")}
            </Link>
          </nav>
          <p className="text-sm text-gray-500 dark:text-foreground/50">
            {t("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
