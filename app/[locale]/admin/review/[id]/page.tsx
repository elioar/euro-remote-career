import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AdminJobReview from "./AdminJobReview";

export default async function ReviewJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getTranslations("AdminReview");

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

  if (!job) redirect("/admin/review");

  return <AdminJobReview job={JSON.parse(JSON.stringify(job))} />;
}
