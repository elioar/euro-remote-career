import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.job.update({
      where: { id, status: "PUBLISHED" },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Job not found or not published — silently ignore
  }
  return NextResponse.json({ ok: true });
}
