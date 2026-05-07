import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const { locale = "en" } = await req.json().catch(() => ({}));

  const employer = await prisma.employerProfile.findUniqueOrThrow({
    where: { id: auth.profile.id },
    select: { stripeCustomerId: true },
  });

  if (!employer.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let session;
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: employer.stripeCustomerId,
      return_url: `${siteUrl}/${locale}/dashboard`,
    });
  } catch (err: unknown) {
    const stripeErr = err as { code?: string };
    if (stripeErr?.code === "resource_missing") {
      await prisma.employerProfile.update({
        where: { id: auth.profile.id },
        data: { stripeCustomerId: null },
      });
      return NextResponse.json({ error: "Billing account not found. Please contact support." }, { status: 404 });
    }
    throw err;
  }

  return NextResponse.json({ url: session.url });
}
