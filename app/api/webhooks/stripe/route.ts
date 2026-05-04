import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { submitForReview } from "@/lib/jobs/lifecycle";

export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { paymentIds, jobId } = session.metadata ?? {};

    if (!paymentIds) return NextResponse.json({ ok: true });

    const ids = paymentIds.split(",").filter(Boolean);
    const now = new Date();
    const intentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

    // Mark all payments as SUCCEEDED
    const payments = await Promise.all(
      ids.map((id) =>
        prisma.payment.update({
          where: { id },
          data: { status: "SUCCEEDED", paidAt: now, stripePaymentIntentId: intentId },
          include: { employer: { include: { user: true } }, plan: true },
        })
      )
    );

    // Submit job for review using the payment that has a jobId linked
    if (jobId) {
      const paymentWithJob = payments.find((p) => p.jobId === jobId);
      const userId = payments[0]?.employer.user.id;
      if (userId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (job && (job.status === "DRAFT" || job.status === "REJECTED")) {
          await submitForReview(jobId, userId);
        }
      }
      void paymentWithJob; // used for type narrowing only
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
