import { prisma } from "@/lib/prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomSuffix(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function generateJobSlug(title: string): Promise<string> {
  const base = slugify(title);
  const slug = `${base}-${randomSuffix()}`;

  const existing = await prisma.job.findUnique({ where: { slug } });
  if (!existing) return slug;

  // Retry with a new suffix if collision (extremely rare)
  return `${base}-${randomSuffix(8)}`;
}
