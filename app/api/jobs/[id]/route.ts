import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/utils/auth";
import { generateJobSlug } from "@/lib/utils/slug";


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireEmployer();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const job = await prisma.job.findUnique({
    where: { id },
    include: { employer: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (auth.profile && job.employerId !== auth.profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(job);
}

export async function PUT(
  req: NextRequest,
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

  if (job.status !== "DRAFT" && job.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Only draft or rejected jobs can be edited" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    const { title, description, requirements, benefits, category, remoteType, asyncLevel, salary, location, timezone, tags } = data;

    const updateData: Record<string, unknown> = {
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      category,
      remoteType,
      asyncLevel: asyncLevel || null,
      salary: salary || null,
      location: location || null,
      timezone: timezone || null,
      tags: tags || [],
    };

    // Regenerate slug if title changed
    if (title && title !== job.title) {
      updateData.title = title;
      updateData.slug = await generateJobSlug(title);
    }

    // Reset to draft if previously rejected
    if (job.status === "REJECTED") {
      updateData.status = "DRAFT";
      updateData.rejectionReason = null;
    }

    const updated = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
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

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
