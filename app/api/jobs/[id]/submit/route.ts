import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/utils/auth";
import { submitForReview } from "@/lib/jobs/lifecycle";
import { getActivePlanForEmployer } from "@/lib/payments/queries";

/**
 * Re-submit a job (mainly for REJECTED → PENDING_REVIEW or DRAFT created from a rejected one).
 * Requires either:
 *   (a) the job already has a linked SUCCEEDED payment (slot already consumed earlier), OR
 *   (b) the employer has an active subscription with available slots.
 *
 * For brand-new jobs the recommended flow is /api/jobs/[id]/use-slot which handles atomic slot claim.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.employerId !== auth.profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Existing linked payment satisfies the slot
  const linkedPayment = await prisma.payment.findFirst({
    where: { jobId: id, status: "SUCCEEDED", employerId: auth.profile.id },
  });

  if (!linkedPayment) {
    // Allow re-submit if employer has an active subscription with at least one available slot
    const activePlan = await getActivePlanForEmployer(auth.profile.id);
    if (!activePlan || activePlan.slotsUsed >= activePlan.totalSlots) {
      return NextResponse.json({ error: "Payment or active subscription required" }, { status: 402 });
    }
  }

  try {
    const updated = await submitForReview(id, auth.user.id);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
