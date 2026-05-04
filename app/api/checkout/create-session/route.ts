import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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

  const mainPaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const shortPaymentId = shortListingPlan
    ? `pay_${Date.now() + 1}_${Math.random().toString(36).slice(2, 9)}`
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const lineItems = [
    {
      price_data: {
        currency: "eur",
        unit_amount: plan.priceInCents,
        product_data: { name: plan.name, description: plan.description ?? undefined },
      },
      quantity: 1,
    },
    ...(shortListingPlan
      ? [
          {
            price_data: {
              currency: "eur",
              unit_amount: shortListingPlan.priceInCents,
              product_data: { name: shortListingPlan.name, description: shortListingPlan.description ?? undefined },
            },
            quantity: 1,
          },
        ]
      : []),
  ];

  const paymentIds = [mainPaymentId, ...(shortPaymentId ? [shortPaymentId] : [])].join(",");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata: {
      jobId: jobId ?? "",
      paymentIds,
    },
    success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: jobId
      ? `${siteUrl}/${locale}/checkout?jobId=${jobId}`
      : `${siteUrl}/${locale}/checkout`,
  });

  const totalAmount = plan.priceInCents + (shortListingPlan?.priceInCents ?? 0);

  // Create main plan payment
  await prisma.payment.create({
    data: {
      id: mainPaymentId,
      employerId: auth.profile.id,
      jobId: null, // plan credits are not tied to a specific job
      planId: plan.id,
      stripeSessionId: session.id,
      amountInCents: plan.priceInCents,
      status: "PENDING",
    },
  });

  // Create short listing payment if requested
  if (shortListingPlan && shortPaymentId) {
    await prisma.payment.create({
      data: {
        id: shortPaymentId,
        employerId: auth.profile.id,
        jobId: jobId ?? null,
        planId: shortListingPlan.id,
        // No stripeSessionId unique constraint issue — use a suffix to differentiate
        stripeSessionId: `${session.id}_sl`,
        amountInCents: shortListingPlan.priceInCents,
        status: "PENDING",
      },
    });
  } else if (!shortListingPlan && jobId) {
    // Single plan purchase with a jobId — link the job to this payment
    await prisma.payment.update({
      where: { id: mainPaymentId },
      data: { jobId },
    });
  }

  return NextResponse.json({ url: session.url });
}
