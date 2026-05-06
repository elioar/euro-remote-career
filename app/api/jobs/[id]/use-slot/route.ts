import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { getActivePlanForEmployer } from "@/lib/payments/queries";

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
  if (!job.title || !job.description || !job.category || !job.remoteType) {
    return NextResponse.json(
      { error: "Title, description, category, and remote type are required" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { paymentId } = body as { paymentId?: string };

  // Path A: one-time payment slot (short-listing or extra-job)
  if (paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });
    if (!payment || payment.employerId !== auth.profile.id || payment.status !== "SUCCEEDED") {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }
    if (payment.plan.slug !== "short-listing" && payment.plan.slug !== "extra-job") {
      return NextResponse.json({ error: "This payment cannot be used as a one-time slot" }, { status: 400 });
    }
    if (payment.jobId) {
      return NextResponse.json({ error: "This slot has already been used" }, { status: 409 });
    }
    const expiresAt = new Date(payment.paidAt!);
    expiresAt.setDate(expiresAt.getDate() + payment.plan.durationDays);
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "This slot has expired" }, { status: 402 });
    }
    if (payment.plan.slug === "extra-job") {
      const activePlan = await getActivePlanForEmployer(auth.profile.id);
      if (!activePlan) {
        return NextResponse.json(
          { error: "An active subscription is required to use extra job slots" },
          { status: 402 }
        );
      }
    }

    // Atomic claim + publish in single transaction
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.payment.updateMany({
          where: { id: paymentId, jobId: null },
          data: { jobId: id },
        });
        if (claimed.count === 0) throw new Error("This slot was just used");
        await tx.job.update({
          where: { id, status: { in: ["DRAFT", "REJECTED"] } },
          data: { status: "PENDING_REVIEW", rejectionReason: null },
        });
      });
    } catch (err) {
      const msg = (err as Error).message;
      return NextResponse.json({ error: msg || "Failed to claim slot" }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  }

  // Path B: use base subscription slot
  const activePlan = await getActivePlanForEmployer(auth.profile.id);
  if (!activePlan) {
    return NextResponse.json({ error: "No active subscription" }, { status: 402 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const slotsUsed = await tx.job.count({
        where: {
          employerId: auth.profile!.id,
          status: { in: ["PENDING_REVIEW", "PUBLISHED"] },
          createdAt: { gte: activePlan.periodStart },
          payments: {
            none: { status: "SUCCEEDED", plan: { slug: { in: ["short-listing", "extra-job"] } } },
          },
        },
      });
      if (slotsUsed >= activePlan.totalSlots) {
        throw new Error("No available slots in your plan");
      }
      await tx.job.update({
        where: { id, status: { in: ["DRAFT", "REJECTED"] } },
        data: { status: "PENDING_REVIEW", rejectionReason: null },
      });
    });
  } catch (err) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg || "Failed to claim slot" }, { status: 402 });
  }

  return NextResponse.json({ ok: true });
}
