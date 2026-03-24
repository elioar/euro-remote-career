import { NextRequest, NextResponse } from "next/server";
import { expireJobs } from "@/lib/jobs/lifecycle";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await expireJobs();
    return NextResponse.json({ expired: count });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
