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

export async function getActivePlanForEmployer(employerId: string) {
  const payment = await prisma.payment.findFirst({
    where: { employerId, status: "SUCCEEDED" },
    include: { plan: true },
    orderBy: { paidAt: "desc" },
  });
  if (!payment || !payment.paidAt) return null;

  const expiresAt = new Date(payment.paidAt);
  expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
  const now = new Date();
  if (now > expiresAt) return null;

  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const slotsUsed = await prisma.payment.count({
    where: {
      employerId,
      status: "SUCCEEDED",
      paidAt: { gte: payment.paidAt },
      job: { status: { in: ["PENDING_REVIEW", "PUBLISHED"] } },
    },
  });

  return {
    name: payment.plan.name,
    slug: payment.plan.slug,
    totalSlots: payment.plan.jobSlots,
    slotsUsed,
    daysLeft,
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
