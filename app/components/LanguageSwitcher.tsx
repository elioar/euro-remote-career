"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALES = [
  { code: "el", label: "GR", flag: "🇬🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-1 dark:bg-slate-700">
      {routing.locales.map((loc) => {
        const isActive = locale === loc;
        const label = loc === "el" ? "GR" : "EN";
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            aria-label={loc === "el" ? "Ελληνικά" : "English"}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? "bg-white text-navy-primary shadow-sm dark:bg-blue-500 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
