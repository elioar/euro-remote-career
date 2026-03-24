import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma";

type AuthResult = {
  authUser: { id: string; email: string };
  user: User;
} | null;

export async function getCurrentUser(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) return null;

  return { authUser: { id: authUser.id, email: authUser.email }, user };
}

export async function requireEmployer() {
  const result = await getCurrentUser();
  if (!result) return { error: "Unauthorized" as const, status: 401 as const };
  if (result.user.role !== "EMPLOYER")
    return { error: "Forbidden" as const, status: 403 as const };

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: result.user.id },
  });

  return { ...result, profile };
}

export async function requireAdmin() {
  const result = await getCurrentUser();
  if (!result) return { error: "Unauthorized" as const, status: 401 as const };
  if (result.user.role !== "ADMIN")
    return { error: "Forbidden" as const, status: 403 as const };

  return result;
}
