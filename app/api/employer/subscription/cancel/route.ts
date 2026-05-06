import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const subscription = await prisma.subscription.findFirst({
    where: {
      employerId: auth.profile.id,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  // Cancel at period end so user retains access until paid period expires
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true },
  });

  return NextResponse.json({ ok: true });
}
