import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/candidate/cvs/[id] — remove a CV from DB (caller handles storage deletion)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCandidate();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  const cv = await prisma.candidateCV.findUnique({ where: { id } });
  if (!cv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!auth.profile || cv.candidateId !== auth.profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.candidateCV.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
