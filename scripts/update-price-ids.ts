import { prisma } from "../lib/prisma";

async function main() {
  await prisma.plan.update({
    where: { slug: "basic" },
    data: { stripePriceId: "price_1TUFkjEQY58AkF87uF4fxxs2" },
  });
  await prisma.plan.update({
    where: { slug: "pro" },
    data: { stripePriceId: "price_1TUFkyEQY58AkF87jwtZn2HC" },
  });
  const plans = await prisma.plan.findMany({
    select: { slug: true, stripePriceId: true },
  });
  console.log(plans);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
