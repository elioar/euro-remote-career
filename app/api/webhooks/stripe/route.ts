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
    const { paymentId, jobId } = session.metadata ?? {};

    if (!paymentId) return NextResponse.json({ ok: true });

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCEEDED",
        paidAt: new Date(),
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
      include: { employer: { include: { user: true } } },
    });

    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job && (job.status === "DRAFT" || job.status === "REJECTED")) {
        await submitForReview(jobId, payment.employer.user.id);
      }
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
