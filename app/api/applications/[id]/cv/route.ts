import { NextRequest, NextResponse } from "next/server";
import { requireEmployer } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// GET /api/applications/[id]/cv — generate signed URL for applicant's CV (employer only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEmployer();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.profile) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.job.employerId !== auth.profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!application.cvPath) {
    return NextResponse.json({ error: "No CV attached to this application" }, { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase.storage
    .from("cv-uploads")
    .createSignedUrl(application.cvPath, 120);

  if (error || !data?.signedUrl) {
    console.error("Supabase storage error:", error, "cvPath:", application.cvPath);
    return NextResponse.json({ error: "Failed to generate CV link", detail: error?.message }, { status: 500 });
  }

  await prisma.application.update({
    where: { id },
    data: { cvViewedAt: new Date() },
  });

  return NextResponse.json({ url: data.signedUrl });
}
