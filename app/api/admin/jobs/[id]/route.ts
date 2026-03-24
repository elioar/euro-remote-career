import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/auth";
import { approveJob, rejectJob, unpublishJob } from "@/lib/jobs/lifecycle";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: true,
      moderationLogs: {
        include: { admin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await req.json();
    const { action, reason, ...editFields } = data;

    switch (action) {
      case "approve": {
        const updated = await approveJob(id, auth.user.id);
        return NextResponse.json(updated);
      }
      case "reject": {
        if (!reason) {
          return NextResponse.json(
            { error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        const updated = await rejectJob(id, auth.user.id, reason);
        return NextResponse.json(updated);
      }
      case "unpublish": {
        const updated = await unpublishJob(id, auth.user.id);
        return NextResponse.json(updated);
      }
      case "edit": {
        // Admin can edit fields before publishing
        const { title, description, category, remoteType, asyncLevel, salary, location, timezone, tags } = editFields;
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (remoteType !== undefined) updateData.remoteType = remoteType;
        if (asyncLevel !== undefined) updateData.asyncLevel = asyncLevel;
        if (salary !== undefined) updateData.salary = salary;
        if (location !== undefined) updateData.location = location;
        if (timezone !== undefined) updateData.timezone = timezone;
        if (tags !== undefined) updateData.tags = tags;

        const [updated] = await prisma.$transaction([
          prisma.job.update({ where: { id }, data: updateData }),
          prisma.moderationLog.create({
            data: { jobId: id, adminId: auth.user.id, action: "EDITED" },
          }),
        ]);

        return NextResponse.json(updated);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
