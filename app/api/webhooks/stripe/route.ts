import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { syncCheckoutSession, upsertSubscription } from "@/lib/payments/sync";

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }).subscription === "string"
      ? ((invoice as Stripe.Invoice & { subscription?: string }).subscription as string)
      : null;
  if (!subId) return;

  // Idempotency: skip if invoice already recorded
  if (invoice.id) {
    const existing = await prisma.payment.findUnique({ where: { stripeInvoiceId: invoice.id } });
    if (existing) return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subId },
  });
  if (!subscription) return;

  await prisma.payment.create({
    data: {
      employerId: subscription.employerId,
      planId: subscription.planId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId:
        typeof (invoice as Stripe.Invoice & { payment_intent?: string }).payment_intent === "string"
          ? ((invoice as Stripe.Invoice & { payment_intent?: string }).payment_intent as string)
          : null,
      amountInCents: invoice.amount_paid,
      currency: invoice.currency,
      status: "SUCCEEDED",
      paidAt: new Date((invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000)) * 1000),
    },
  });

  // Refresh subscription period from Stripe
  const sub = await stripe.subscriptions.retrieve(subId);
  await upsertSubscription(sub, sub.metadata ?? {});
}

export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await syncCheckoutSession(session.id);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub, sub.metadata ?? {});
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: charge.payment_intent as string, status: "SUCCEEDED" },
          data: { status: "REFUNDED", refundedAt: new Date() },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
