import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

// POST /api/applications — submit an application
export async function POST(req: NextRequest) {
  const auth = await requireCandidate();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.profile) {
    return NextResponse.json({ error: "Complete your profile before applying." }, { status: 400 });
  }

  const { jobId, cvPath, coverLetter } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

  // Verify the job is published
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "PUBLISHED" },
  });
  if (!job) return NextResponse.json({ error: "Job not found or not published" }, { status: 404 });

  // Prevent duplicates
  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: auth.profile.id } },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: auth.profile.id,
      cvPath: cvPath ?? null,
      coverLetter: coverLetter?.trim() || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}

// GET /api/applications — list candidate's own applications
export async function GET() {
  const auth = await requireCandidate();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.profile) return NextResponse.json({ applications: [] });

  const applications = await prisma.application.findMany({
    where: { candidateId: auth.profile.id },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, logoUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
