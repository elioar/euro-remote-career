import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Header } from "@/app/components/Header";
import { BillingHistory } from "./BillingHistory";
import { getEmployerPayments } from "@/lib/payments/queries";

export default async function BillingPage() {
  const t = await getTranslations("Billing");
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { employerProfile: true },
  });
  if (!user || user.role !== "EMPLOYER") redirect("/dashboard");
  if (!user.employerProfile) redirect("/dashboard");

  const payments = await getEmployerPayments(user.employerProfile.id);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-slate-500 dark:text-foreground/60 mt-1">{t("subtitle")}</p>
        </div>
        <BillingHistory payments={JSON.parse(JSON.stringify(payments))} />
      </div>
    </main>
  );
}
