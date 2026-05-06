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
      description: "Perfect for getting started.",
      priceInCents: 2600,
      originalPriceInCents: 13000,
      durationDays: 30,
      jobSlots: 1,
      isAddon: false,
      isSubscription: true,
      sortOrder: 0,
    },
    {
      slug: "extra-job",
      name: "Extra Job Add-on",
      description: "Add 1 more job listing to your active plan.",
      priceInCents: 5000,
      originalPriceInCents: null,
      durationDays: 30,
      jobSlots: 1,
      isAddon: true,
      isSubscription: false,
      sortOrder: 1,
    },
    {
      slug: "pro",
      name: "Pro Plan",
      description: "More jobs, more value.",
      priceInCents: 4000,
      originalPriceInCents: 20000,
      durationDays: 30,
      jobSlots: 6,
      isAddon: false,
      isSubscription: true,
      sortOrder: 2,
    },
    {
      slug: "short-listing",
      name: "Short Listing",
      description: "Need results fast?",
      priceInCents: 1600,
      originalPriceInCents: 8000,
      durationDays: 10,
      jobSlots: 1,
      isAddon: false,
      isSubscription: false,
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
