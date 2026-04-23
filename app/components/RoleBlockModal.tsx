"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X, Briefcase, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  variant: "employerCannotApply" | "candidateCannotPost";
};

export function RoleBlockModal({ open, onClose, variant }: Props) {
  const t = useTranslations("SplitIntent");

  const isApply = variant === "employerCannotApply";
  const Icon = isApply ? User : Briefcase;
  const title = isApply ? t("employerCannotApplyTitle") : t("candidateCannotPostTitle");
  const desc = isApply ? t("employerCannotApplyDesc") : t("candidateCannotPostDesc");
  const ctaLabel = isApply ? t("createCandidateAccount") : t("createEmployerAccount");
  const ctaHref = isApply ? "/register" : "/register?role=EMPLOYER";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label={t("cancel")}
          />
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl border border-border-card bg-white p-6 shadow-xl dark:border-border-muted dark:bg-card-background"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-card-active dark:hover:text-foreground"
              aria-label={t("cancel")}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-primary/10 dark:bg-navy-primary/20">
                <Icon className="h-5 w-5 text-navy-primary dark:text-navy-hover" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-foreground/70">
              {desc}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border-muted px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-muted dark:text-foreground/70 dark:hover:bg-card-active"
              >
                {t("cancel")}
              </button>
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-hover"
              >
                <Icon size={14} />
                {ctaLabel}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
