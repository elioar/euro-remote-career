import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/utils/auth";
import { submitForReview } from "@/lib/jobs/lifecycle";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (auth.profile && job.employerId !== auth.profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await submitForReview(id, auth.user.id);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
