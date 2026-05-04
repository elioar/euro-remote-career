import { prisma } from "@/lib/prisma";

export type PaymentWithDetails = Awaited<ReturnType<typeof getEmployerPayments>>[number];

export async function getEmployerPayments(employerId: string) {
  return prisma.payment.findMany({
    where: { employerId },
    include: {
      plan: true,
      job: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Jobs submitted via Short Listing or Extra Job add-on are NOT counted against base plan slots
const NON_PLAN_SLUGS = ["short-listing", "extra-job"];

export async function getActivePlanForEmployer(employerId: string) {
  // Only base plans (not addons, not short-listing)
  const payment = await prisma.payment.findFirst({
    where: {
      employerId,
      status: "SUCCEEDED",
      plan: { isAddon: false, slug: { not: "short-listing" } },
    },
    include: { plan: true },
    orderBy: { paidAt: "desc" },
  });

  if (!payment || !payment.paidAt) return null;

  const expiresAt = new Date(payment.paidAt);
  expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
  const now = new Date();
  if (now > expiresAt) return null;

  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Only count jobs submitted via the base plan (not via short-listing or extra-job)
  const slotsUsed = await prisma.job.count({
    where: {
      employerId,
      status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
      createdAt: { gte: payment.paidAt },
      payments: { none: { status: "SUCCEEDED", plan: { slug: { in: NON_PLAN_SLUGS } } } },
    },
  });

  return {
    name: payment.plan.name,
    slug: payment.plan.slug,
    basePlanSlots: payment.plan.jobSlots,
    totalSlots: payment.plan.jobSlots, // extra-job slots tracked separately
    slotsUsed,
    daysLeft,
    planPaymentPaidAt: payment.paidAt,
  };
}

export async function getUsedJobSlots(employerId: string): Promise<number> {
  return prisma.job.count({
    where: {
      employerId,
      status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
    },
  });
}
