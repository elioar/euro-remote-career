import { prisma } from "@/lib/prisma";

export type PaymentWithDetails = Awaited<ReturnType<typeof getEmployerPayments>>[number];

// Jobs submitted via Short Listing or Extra Job add-on are NOT counted against base plan slots
export const NON_PLAN_SLUGS = ["short-listing", "extra-job"] as const;

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

/** Count base-plan-consuming jobs created in the active plan window. */
export async function countBaseSlotJobs(employerId: string, periodStart: Date) {
  return prisma.job.count({
    where: {
      employerId,
      status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
      createdAt: { gte: periodStart },
      payments: { none: { status: "SUCCEEDED", plan: { slug: { in: [...NON_PLAN_SLUGS] } } } },
    },
  });
}

/**
 * Returns the employer's active subscription (Basic/Pro) with slot usage in the current period.
 * Falls back to null if no active subscription exists.
 */
export async function getActivePlanForEmployer(employerId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      employerId,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return null;

  const now = new Date();
  if (now > subscription.currentPeriodEnd) return null;

  const daysLeft = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const slotsUsed = await countBaseSlotJobs(employerId, subscription.currentPeriodStart);

  return {
    subscriptionId: subscription.id,
    name: subscription.plan.name,
    slug: subscription.plan.slug,
    basePlanSlots: subscription.plan.jobSlots,
    totalSlots: subscription.plan.jobSlots,
    slotsUsed,
    daysLeft,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    status: subscription.status,
  };
}
