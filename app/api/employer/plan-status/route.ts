import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const employerId = auth.profile.id;
  const now = new Date();

  // All succeeded payments for non-addon plans (Basic / Pro)
  const payments = await prisma.payment.findMany({
    where: { employerId, status: "SUCCEEDED" },
    include: { plan: true },
    orderBy: { paidAt: "desc" },
  });

  // Build list of usable plan slots (still within their window)
  const usablePlans: {
    paymentId: string;
    name: string;
    slug: string;
    totalSlots: number;
    slotsUsed: number;
    availableSlots: number;
    daysLeft: number;
  }[] = [];

  for (const payment of payments) {
    if (payment.plan.isAddon || payment.plan.slug === "short-listing") continue;
    if (!payment.paidAt) continue;

    const expiresAt = new Date(payment.paidAt);
    expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
    if (now > expiresAt) continue;

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const slotsUsed = await prisma.job.count({
      where: {
        employerId,
        status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
        createdAt: { gte: payment.paidAt },
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

  const quickListingPlan = await prisma.plan.findFirst({
    where: { slug: "short-listing", isActive: true },
    select: { id: true, name: true, priceInCents: true, durationDays: true },
  });

  return NextResponse.json({ usablePlans, quickListing: quickListingPlan ?? null });
}
