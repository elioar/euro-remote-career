"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5 dark:bg-slate-700">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === loc
              ? "bg-white text-navy-primary shadow-sm dark:bg-slate-500 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-label={loc === "el" ? "Ελληνικά" : "English"}
          aria-current={locale === loc ? "true" : undefined}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
