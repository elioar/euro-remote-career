import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as never } : {};

  const jobs = await prisma.job.findMany({
    where,
    include: {
      employer: {
        select: { companyName: true, logoUrl: true, website: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
