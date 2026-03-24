import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/utils/auth";
import { generateJobSlug } from "@/lib/utils/slug";

export async function POST(req: NextRequest) {
  const auth = await requireEmployer();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.profile) {
    return NextResponse.json(
      { error: "Complete your employer profile first" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    const { title, description, requirements, benefits, category, remoteType, asyncLevel, salary, location, timezone, tags } = data;

    if (!title || !description || !category || !remoteType) {
      return NextResponse.json(
        { error: "Title, description, category, and remote type are required" },
        { status: 400 }
      );
    }

    const slug = await generateJobSlug(title);

    const job = await prisma.job.create({
      data: {
        employerId: auth.profile.id,
        title,
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
        slug,
        status: "DRAFT",
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireEmployer();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.profile) {
    return NextResponse.json({ jobs: [] });
  }

  const jobs = await prisma.job.findMany({
    where: { employerId: auth.profile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
