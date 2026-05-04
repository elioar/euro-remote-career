import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

const NON_PLAN_SLUGS = ["short-listing", "extra-job"];

export async function GET() {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const employerId = auth.profile.id;
  const now = new Date();

  const payments = await prisma.payment.findMany({
    where: { employerId, status: "SUCCEEDED" },
    include: { plan: true },
    orderBy: { paidAt: "desc" },
  });

  const usablePlans: {
    paymentId: string;
    name: string;
    slug: string;
    totalSlots: number;
    slotsUsed: number;
    availableSlots: number;
    daysLeft: number;
  }[] = [];

  // Determine if there's an active base plan first
  const hasActivePlan = payments.some((p) => {
    if (p.plan.isAddon || p.plan.slug === "short-listing" || !p.paidAt) return false;
    const exp = new Date(p.paidAt);
    exp.setDate(exp.getDate() + p.plan.durationDays);
    return now <= exp;
  });

  for (const payment of payments) {
    if (!payment.paidAt) continue;

    const expiresAt = new Date(payment.paidAt);
    expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
    if (now > expiresAt) continue;

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (payment.plan.slug === "short-listing") continue;

    if (payment.plan.slug === "extra-job") {
      // Extra-job only usable when an active base plan exists
      if (!hasActivePlan) continue;
      if (payment.jobId !== null) continue;
      usablePlans.push({
        paymentId: payment.id,
        name: payment.plan.name,
        slug: payment.plan.slug,
        totalSlots: 1,
        slotsUsed: 0,
        availableSlots: 1,
        daysLeft,
      });
      continue;
    }

    if (payment.plan.isAddon) continue;

    // Base plan: count only jobs NOT submitted via short-listing or extra-job
    const slotsUsed = await prisma.job.count({
      where: {
        employerId,
        status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
        createdAt: { gte: payment.paidAt },
        payments: { none: { status: "SUCCEEDED", plan: { slug: { in: NON_PLAN_SLUGS } } } },
      },
    });

    const availableSlots = Math.max(0, payment.plan.jobSlots - slotsUsed);
    if (availableSlots > 0) {
      usablePlans.push({
        paymentId: payment.id,
        name: payment.plan.name,
        slug: payment.plan.slug,
        totalSlots: payment.plan.jobSlots,
        slotsUsed,
        availableSlots,
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

  return NextResponse.json({
    usablePlans,
    quickListing: quickListingPlan ?? null,
    extraJob: extraJobPlan ?? null,
    hasActivePlan,
  });
}
