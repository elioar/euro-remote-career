import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/utils/auth";

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

  if (job.status !== "ARCHIVED" && job.status !== "EXPIRED") {
    return NextResponse.json(
      { error: "Only archived or expired jobs can be reactivated" },
      { status: 400 }
    );
  }

  const updated = await prisma.job.update({
    where: { id },
    data: { status: "DRAFT" },
  });

  return NextResponse.json(updated);
}
