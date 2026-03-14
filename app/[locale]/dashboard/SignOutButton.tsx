"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function SignOutButton() {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
    >
      <LogOut className="w-4 h-4" />
      {t("signOut")}
    </button>
  );
}
