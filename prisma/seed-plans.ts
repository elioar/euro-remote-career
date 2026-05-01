import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      slug: "basic",
      name: "Basic Plan",
      description: "1 job listing for 30 days",
      priceInCents: 3900,
      originalPriceInCents: 5900,
      durationDays: 30,
      jobSlots: 1,
      isAddon: false,
      sortOrder: 0,
    },
    {
      slug: "extra-job",
      name: "Extra Job Add-on",
      description: "Add 1 more job slot to your Basic plan",
      priceInCents: 1500,
      originalPriceInCents: null,
      durationDays: 30,
      jobSlots: 1,
      isAddon: true,
      sortOrder: 1,
    },
    {
      slug: "pro",
      name: "Pro Plan",
      description: "Up to 6 job listings for 30 days",
      priceInCents: 7900,
      originalPriceInCents: 11900,
      durationDays: 30,
      jobSlots: 6,
      isAddon: false,
      sortOrder: 2,
    },
    {
      slug: "short-listing",
      name: "Short Listing",
      description: "1 job listing for 10 days",
      priceInCents: 1900,
      originalPriceInCents: null,
      durationDays: 10,
      jobSlots: 1,
      isAddon: false,
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`✓ Upserted plan: ${plan.name}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
