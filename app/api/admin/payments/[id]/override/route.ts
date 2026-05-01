import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { submitForReview } from "@/lib/jobs/lifecycle";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { employer: { include: { user: true } }, job: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const updated = await prisma.payment.update({
    where: { id },
    data: { status: "SUCCEEDED", paidAt: new Date() },
  });

  if (payment.jobId && payment.job && (payment.job.status === "DRAFT" || payment.job.status === "REJECTED")) {
    await submitForReview(payment.jobId, auth.user.id);
  }

  return NextResponse.json(updated);
}
