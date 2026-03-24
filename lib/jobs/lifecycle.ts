import { prisma } from "@/lib/prisma";
import type { Job } from "@/lib/generated/prisma";

export async function submitForReview(jobId: string): Promise<Job> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  if (job.status !== "DRAFT") {
    throw new Error("Only draft jobs can be submitted for review");
  }

  // Validate required fields
  if (!job.title || !job.description || !job.category || !job.remoteType) {
    throw new Error("Title, description, category, and remote type are required");
  }

  return prisma.job.update({
    where: { id: jobId },
    data: { status: "PENDING_REVIEW" },
  });
}

export async function approveJob(jobId: string, adminId: string): Promise<Job> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  if (job.status !== "PENDING_REVIEW") {
    throw new Error("Only pending jobs can be approved");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [updated] = await prisma.$transaction([
    prisma.job.update({
      where: { id: jobId },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
        expiresAt,
        rejectionReason: null,
      },
    }),
    prisma.moderationLog.create({
      data: { jobId, adminId, action: "APPROVED" },
    }),
  ]);

  return updated;
}

export async function rejectJob(
  jobId: string,
  adminId: string,
  reason: string
): Promise<Job> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  if (job.status !== "PENDING_REVIEW") {
    throw new Error("Only pending jobs can be rejected");
  }

  if (!reason.trim()) {
    throw new Error("Rejection reason is required");
  }

  const [updated] = await prisma.$transaction([
    prisma.job.update({
      where: { id: jobId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    }),
    prisma.moderationLog.create({
      data: { jobId, adminId, action: "REJECTED", reason },
    }),
  ]);

  return updated;
}

export async function archiveJob(jobId: string): Promise<Job> {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
    },
  });
}

export async function unpublishJob(jobId: string, adminId?: string): Promise<Job> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  if (job.status !== "PUBLISHED") {
    throw new Error("Only published jobs can be unpublished");
  }

  const updates = [
    prisma.job.update({
      where: { id: jobId },
      data: {
        status: "DRAFT",
        publishedAt: null,
        expiresAt: null,
      },
    }),
  ];

  if (adminId) {
    updates.push(
      prisma.moderationLog.create({
        data: { jobId, adminId, action: "UNPUBLISHED" },
      }) as never
    );
  }

  const [updated] = await prisma.$transaction(updates);
  return updated;
}

export async function expireJobs(): Promise<number> {
  const result = await prisma.job.updateMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });

  return result.count;
}
