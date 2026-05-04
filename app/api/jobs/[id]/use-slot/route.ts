import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { getActivePlanForEmployer } from "@/lib/payments/queries";
import { submitForReview } from "@/lib/jobs/lifecycle";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.employerId !== auth.profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "DRAFT" && job.status !== "REJECTED") {
    return NextResponse.json({ error: "Job is not in a submittable state" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { paymentId } = body as { paymentId?: string };

  if (paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });
    if (!payment || payment.employerId !== auth.profile.id || payment.status !== "SUCCEEDED") {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }
    if (payment.plan.isAddon || payment.plan.slug === "short-listing") {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }
    const expiresAt = new Date(payment.paidAt!);
    expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "Plan has expired" }, { status: 402 });
    }
    const slotsUsed = await prisma.job.count({
      where: {
        employerId: auth.profile.id,
        status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
        createdAt: { gte: payment.paidAt! },
      },
    });
    if (slotsUsed >= payment.plan.jobSlots) {
      return NextResponse.json({ error: "No available slots in this plan" }, { status: 402 });
    }
  } else {
    const activePlan = await getActivePlanForEmployer(auth.profile.id);
    if (!activePlan) return NextResponse.json({ error: "No active plan" }, { status: 402 });
    const availableSlots = activePlan.totalSlots - activePlan.slotsUsed;
    if (availableSlots <= 0) return NextResponse.json({ error: "No available slots in your plan" }, { status: 402 });
  }

  await submitForReview(id, auth.authUser.id);

  return NextResponse.json({ ok: true });
}
