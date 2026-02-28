"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    slug: "tech",
    title: "Tech",
    description: "Engineering, development, and technical roles.",
  },
  {
    slug: "design",
    title: "Design",
    description: "Product, UX, and visual design positions.",
  },
  {
    slug: "marketing",
    title: "Marketing",
    description: "Growth, content, and brand marketing roles.",
  },
  {
    slug: "product",
    title: "Product",
    description: "Product management and strategy positions.",
  },
] as const;

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
  return (
    <section className="border-b border-gray-100 bg-white py-12 sm:py-16 lg:py-20 dark:border-slate-700 dark:bg-background">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: easeCubic }}
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl"
        >
          Browse by Category
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
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-lg sm:p-6 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500"
              >
                <motion.span
                  className="block"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <h3 className="font-semibold text-navy-primary dark:text-blue-300">{cat.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{cat.description}</p>
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
