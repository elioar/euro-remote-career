import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

// GET /api/candidate/cvs — list candidate's CVs
export async function GET() {
  const auth = await requireCandidate();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.profile) {
    return NextResponse.json({ cvs: [] });
  }

  const cvs = await prisma.candidateCV.findMany({
    where: { candidateId: auth.profile.id },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ cvs });
}

// POST /api/candidate/cvs — save a newly uploaded CV
export async function POST(req: NextRequest) {
  const auth = await requireCandidate();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { fileName, storagePath } = await req.json();
  if (!fileName || !storagePath) {
    return NextResponse.json({ error: "fileName and storagePath are required" }, { status: 400 });
  }

  // Ensure candidate profile exists
  const profile = auth.profile ?? (await prisma.candidateProfile.findUnique({
    where: { userId: auth.user.id },
  }));

  if (!profile) {
    return NextResponse.json({ error: "Candidate profile not found. Please complete your profile first." }, { status: 404 });
  }

  const cv = await prisma.candidateCV.create({
    data: { candidateId: profile.id, fileName, storagePath },
  });

  return NextResponse.json({ cv }, { status: 201 });
}
