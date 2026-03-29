import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LayoutDashboard, ClipboardList, Briefcase, Settings, ShieldCheck, PieChart } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("AdminDashboard");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const ADMIN_EMAILS = ["euroremotecareer@gmail.com", "mycomments2026@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes(authUser.email ?? "");

  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    if (!user || user.role !== "ADMIN") redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: t("pageTitle"), icon: LayoutDashboard },
    { href: "/admin/review", label: t("reviewQueue"), icon: ClipboardList },
    { href: "/admin/jobs", label: t("allJobs"), icon: Briefcase },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6 ml-4">Main Menu</h3>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-foreground/50 hover:text-navy-primary hover:bg-navy-primary/5 transition-all duration-300"
                    >
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6 ml-4">System</h3>
                <nav className="flex flex-col gap-2">
                  <button className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-foreground/50 hover:text-navy-primary hover:bg-navy-primary/5 transition-all duration-300 w-full text-left">
                    <PieChart className="w-5 h-5 transition-transform group-hover:scale-110" />
                    Analytics
                  </button>
                  <button className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-foreground/50 hover:text-navy-primary hover:bg-navy-primary/5 transition-all duration-300 w-full text-left">
                    <Settings className="w-5 h-5 transition-transform group-hover:scale-110" />
                    Site Settings
                  </button>
                </nav>
              </div>

              <div className="p-5 rounded-3xl bg-foreground/[0.03] border border-foreground/5 relative overflow-hidden">
                <ShieldCheck className="absolute -bottom-2 -right-2 w-16 h-16 text-foreground/[0.03]" />
                <p className="text-[10px] font-bold text-foreground/40 leading-relaxed relative z-10">
                  Logged in as <br/>
                  <span className="text-foreground/70">{authUser.email}</span>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

