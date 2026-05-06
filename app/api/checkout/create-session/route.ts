import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

async function getOrCreateCustomer(employerId: string, email: string, companyName: string): Promise<string> {
  const employer = await prisma.employerProfile.findUniqueOrThrow({
    where: { id: employerId },
    select: { stripeCustomerId: true },
  });
  if (employer.stripeCustomerId) return employer.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: companyName,
    metadata: { employerId },
  });
  await prisma.employerProfile.update({
    where: { id: employerId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function POST(req: Request) {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const { jobId, planId, addShortListingId, locale = "en" } = await req.json();
  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  let shortListingPlan = null;
  if (addShortListingId) {
    shortListingPlan = await prisma.plan.findUnique({ where: { id: addShortListingId } });
    if (!shortListingPlan || !shortListingPlan.isActive || shortListingPlan.slug !== "short-listing") {
      return NextResponse.json({ error: "Invalid short listing plan" }, { status: 400 });
    }
  }

  if (jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.employerId !== auth.profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (job.status !== "DRAFT" && job.status !== "REJECTED") {
      return NextResponse.json({ error: "Job is not in a payable state" }, { status: 400 });
    }
  }

  // Block buying a new subscription if one is already active
  if (plan.isSubscription) {
    const activeSub = await prisma.subscription.findFirst({
      where: {
        employerId: auth.profile.id,
        status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
      },
    });
    if (activeSub) {
      return NextResponse.json(
        { error: "You already have an active subscription. Cancel it before purchasing another." },
        { status: 409 }
      );
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const customerId = await getOrCreateCustomer(auth.profile.id, auth.authUser.email!, auth.profile.companyName);

  // Build line items
  type SessionCreateParams = NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>;
  const lineItems: NonNullable<SessionCreateParams["line_items"]> = [];

  // Main plan line item
  if (plan.isSubscription) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: plan.priceInCents,
        product_data: { name: plan.name, description: plan.description ?? undefined },
        recurring: { interval: "month" },
      },
      quantity: 1,
    });
  } else {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: plan.priceInCents,
        product_data: { name: plan.name, description: plan.description ?? undefined },
      },
      quantity: 1,
    });
  }

  // Optional short-listing add-on (one-time) — only valid alongside subscription plans
  if (shortListingPlan) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: shortListingPlan.priceInCents,
        product_data: { name: shortListingPlan.name, description: shortListingPlan.description ?? undefined },
      },
      quantity: 1,
    });
  }

  const mode = plan.isSubscription ? "subscription" : "payment";

  // Pre-create Payment row(s) so we can reference them in metadata.
  // For subscription mode, the main "payment" row is symbolic — actual recurring payments
  // are created from invoice.paid webhooks.
  const oneTimePayments: { id: string; planId: string; amountInCents: number; jobId: string | null }[] = [];

  if (!plan.isSubscription) {
    const mainPayment = await prisma.payment.create({
      data: {
        employerId: auth.profile.id,
        jobId: shortListingPlan ? null : (jobId ?? null),
        planId: plan.id,
        amountInCents: plan.priceInCents,
        status: "PENDING",
      },
    });
    oneTimePayments.push({ id: mainPayment.id, planId: plan.id, amountInCents: plan.priceInCents, jobId: mainPayment.jobId });
  }

  if (shortListingPlan) {
    const slPayment = await prisma.payment.create({
      data: {
        employerId: auth.profile.id,
        jobId: jobId ?? null,
        planId: shortListingPlan.id,
        amountInCents: shortListingPlan.priceInCents,
        status: "PENDING",
      },
    });
    oneTimePayments.push({ id: slPayment.id, planId: shortListingPlan.id, amountInCents: shortListingPlan.priceInCents, jobId: slPayment.jobId });
  }

  const metadata: Record<string, string> = {
    employerId: auth.profile.id,
    planId: plan.id,
    locale,
  };
  if (jobId) metadata.jobId = jobId;
  if (oneTimePayments.length > 0) metadata.paymentIds = oneTimePayments.map((p) => p.id).join(",");

  const session = await stripe.checkout.sessions.create({
    mode,
    customer: customerId,
    line_items: lineItems,
    metadata,
    ...(mode === "subscription" && { subscription_data: { metadata } }),
    success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: jobId
      ? `${siteUrl}/${locale}/checkout?jobId=${jobId}`
      : `${siteUrl}/${locale}/checkout`,
  });

  // Link sessionId on pending one-time payments (for non-subscription only)
  if (oneTimePayments.length > 0) {
    await prisma.payment.updateMany({
      where: { id: { in: oneTimePayments.map((p) => p.id) } },
      data: { stripeSessionId: session.id },
    });
  }

  return NextResponse.json({ url: session.url });
}
