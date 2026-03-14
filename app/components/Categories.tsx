"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const easeCubic = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: easeCubic },
  }),
};

export function Categories() {
  const t = useTranslations("Categories");

  const categories = [
    { slug: "Tech", title: t("techTitle"), description: t("techDesc") },
    { slug: "Design", title: t("designTitle"), description: t("designDesc") },
    { slug: "Marketing", title: t("marketingTitle"), description: t("marketingDesc") },
    { slug: "Product", title: t("productTitle"), description: t("productDesc") },
  ];

  return (
    <section className="border-b border-border-muted bg-white py-12 sm:py-16 lg:py-20 dark:border-border-muted dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: easeCubic }}
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl"
        >
          {t("title")}
        </motion.h2>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-24px" }}
              variants={cardVariants}
            >
              <Link
                href={`/jobs?category=${cat.slug}`}
                className="block rounded-xl border border-border-card bg-white p-4 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-lg sm:p-6 dark:border-border-card dark:bg-card-background dark:hover:bg-card-active dark:hover:border-white/20"
              >
                <motion.span
                  className="block"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <h3 className="font-semibold text-navy-primary dark:text-foreground">{cat.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-foreground/70">{cat.description}</p>
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
