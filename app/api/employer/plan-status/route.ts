import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { countBaseSlotJobs, getActivePlanForEmployer } from "@/lib/payments/queries";

export async function GET() {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const employerId = auth.profile.id;
  const now = new Date();

  const usablePlans: {
    paymentId?: string;
    subscriptionId?: string;
    name: string;
    slug: string;
    totalSlots: number;
    slotsUsed: number;
    availableSlots: number;
    daysLeft: number;
  }[] = [];

  const activePlan = await getActivePlanForEmployer(employerId);
  const hasActivePlan = !!activePlan;

  if (activePlan) {
    const availableSlots = Math.max(0, activePlan.totalSlots - activePlan.slotsUsed);
    if (availableSlots > 0) {
      usablePlans.push({
        subscriptionId: activePlan.subscriptionId,
        name: activePlan.name,
        slug: activePlan.slug,
        totalSlots: activePlan.totalSlots,
        slotsUsed: activePlan.slotsUsed,
        availableSlots,
        daysLeft: activePlan.daysLeft,
      });
    }
  }

  // Extra-job: only when an active base plan exists
  if (hasActivePlan) {
    const extraJobPayments = await prisma.payment.findMany({
      where: {
        employerId,
        status: "SUCCEEDED",
        plan: { slug: "extra-job" },
        jobId: null,
      },
      include: { plan: true },
      orderBy: { paidAt: "desc" },
    });

    for (const payment of extraJobPayments) {
      if (!payment.paidAt) continue;
      const expiresAt = new Date(payment.paidAt);
      expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
      if (now > expiresAt) continue;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      usablePlans.push({
        paymentId: payment.id,
        name: payment.plan.name,
        slug: payment.plan.slug,
        totalSlots: 1,
        slotsUsed: 0,
        availableSlots: 1,
        daysLeft,
      });
    }
  }

  const [quickListingPlan, extraJobPlan] = await Promise.all([
    prisma.plan.findFirst({
      where: { slug: "short-listing", isActive: true },
      select: { id: true, name: true, priceInCents: true, durationDays: true },
    }),
    prisma.plan.findFirst({
      where: { slug: "extra-job", isActive: true },
      select: { id: true, name: true, priceInCents: true },
    }),
  ]);

  // Suppress reference to keep linter quiet — still useful to keep around
  void countBaseSlotJobs;

  return NextResponse.json({
    usablePlans,
    quickListing: quickListingPlan ?? null,
    extraJob: extraJobPlan ?? null,
    hasActivePlan,
  });
}
