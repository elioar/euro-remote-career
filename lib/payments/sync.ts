import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { submitForReview } from "@/lib/jobs/lifecycle";

type SubStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "TRIALING";

export function mapStripeStatus(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    case "incomplete":
    case "unpaid":
    case "paused":
      return "INCOMPLETE";
    default:
      return "INCOMPLETE";
  }
}

export async function upsertSubscription(sub: Stripe.Subscription, metadata: Record<string, string>) {
  const employerId = metadata.employerId ?? sub.metadata?.employerId;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const item = sub.items.data[0];
  const periodStart = new Date(item.current_period_start * 1000);
  const periodEnd = new Date(item.current_period_end * 1000);

  // Resolve planId: prefer metadata, otherwise look up by stripePriceId
  let planId = metadata.planId ?? sub.metadata?.planId;
  if (!planId) {
    const priceId = typeof item.price === "string" ? item.price : item.price?.id;
    if (priceId) {
      const plan = await prisma.plan.findFirst({ where: { stripePriceId: priceId } });
      planId = plan?.id ?? undefined;
    }
  }

  // Resolve employerId from stripeCustomerId if missing
  let resolvedEmployerId = employerId;
  if (!resolvedEmployerId) {
    const employer = await prisma.employerProfile.findFirst({ where: { stripeCustomerId: customerId } });
    resolvedEmployerId = employer?.id;
  }

  if (!resolvedEmployerId || !planId) {
    console.warn("Subscription missing employerId or planId", sub.id, { resolvedEmployerId, planId });
    return;
  }

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      employerId: resolvedEmployerId,
      planId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: customerId,
      status: mapStripeStatus(sub.status),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : null,
    },
    update: {
      planId,
      status: mapStripeStatus(sub.status),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : null,
    },
  });
}

export async function syncCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Only process completed sessions
  if (session.status !== "complete") return;

  const { paymentIds, jobId } = session.metadata ?? {};

  // Subscription mode → upsert Subscription row
  if (session.mode === "subscription" && session.subscription) {
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    await upsertSubscription(sub, session.metadata ?? {});
  }

  // One-time payments → mark SUCCEEDED idempotently
  if (paymentIds) {
    const ids = paymentIds.split(",").filter(Boolean);
    const now = new Date();
    const intentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

    await prisma.payment.updateMany({
      where: { id: { in: ids }, status: "PENDING" },
      data: { status: "SUCCEEDED", paidAt: now, stripePaymentIntentId: intentId },
    });

    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job && (job.status === "DRAFT" || job.status === "REJECTED")) {
        const employer = await prisma.employerProfile.findUnique({
          where: { id: job.employerId },
          include: { user: true },
        });
        if (employer) {
          try {
            await submitForReview(jobId, employer.userId);
          } catch (err) {
            console.warn("submitForReview skipped:", (err as Error).message);
          }
        }
      }
    }
  }
}
