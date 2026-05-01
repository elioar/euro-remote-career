import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const { jobId, planId, locale = "en" } = await req.json();

  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  if (jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.employerId !== auth.profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (job.status !== "DRAFT" && job.status !== "REJECTED") {
      return NextResponse.json({ error: "Job is not in a payable state" }, { status: 400 });
    }
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: plan.priceInCents,
          product_data: { name: plan.name, description: plan.description ?? undefined },
        },
        quantity: 1,
      },
    ],
    metadata: { jobId: jobId ?? "", paymentId },
    success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: jobId
      ? `${siteUrl}/${locale}/checkout?jobId=${jobId}`
      : `${siteUrl}/${locale}/checkout`,
  });

  await prisma.payment.create({
    data: {
      id: paymentId,
      employerId: auth.profile.id,
      jobId: jobId ?? null,
      planId: plan.id,
      stripeSessionId: session.id,
      amountInCents: plan.priceInCents,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: session.url });
}
