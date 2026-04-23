import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      employerProfile: true,
      candidateProfile: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    employerProfile: user.employerProfile,
    candidateProfile: user.candidateProfile,
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();

  try {
    if (user.role === "EMPLOYER") {
      const { companyName, logoUrl, website, description } = data;
      const profile = await prisma.employerProfile.upsert({
        where: { userId: user.id },
        update: { companyName, logoUrl, website, description },
        create: { userId: user.id, companyName, logoUrl, website, description },
      });
      return NextResponse.json(profile);
    }

    if (user.role === "CANDIDATE") {
      const { fullName, email, address, occupation, age, profileImageUrl } = data;
      const profile = await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: { fullName, email, address, occupation, age: age ? Number(age) : null, profileImageUrl },
        create: { userId: user.id, fullName, email, address, occupation, age: age ? Number(age) : null, profileImageUrl },
        include: { cvs: { orderBy: { uploadedAt: "desc" } } },
      });
      return NextResponse.json(profile);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
