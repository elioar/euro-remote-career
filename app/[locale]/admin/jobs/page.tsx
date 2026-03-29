import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Briefcase, Building2, LayoutDashboard, ArrowRight } from "lucide-react";

const STATUS_STYLING: Record<string, { label: string; class: string; dot: string }> = {
  DRAFT: { 
    label: "DRAFT", 
    class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400"
  },
  PENDING_REVIEW: { 
    label: "PENDING REVIEW", 
    class: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500"
  },
  PUBLISHED: { 
    label: "PUBLISHED", 
    class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500"
  },
  REJECTED: { 
    label: "REJECTED", 
    class: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500"
  },
  ARCHIVED: { 
    label: "ARCHIVED", 
    class: "bg-slate-100 text-slate-400",
    dot: "bg-slate-300"
  },
  EXPIRED: { 
    label: "EXPIRED", 
    class: "bg-slate-100 text-slate-400",
    dot: "bg-slate-300"
  },
};

export default async function AdminAllJobsPage() {
  const t = await getTranslations("AdminReview");
  const tAdmin = await getTranslations("AdminDashboard");

  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        select: { companyName: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-4 text-sm font-bold">
        <Link
          href="/admin"
          className="text-foreground/30 hover:text-navy-primary transition-colors flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          {tAdmin("pageTitle")}
        </Link>
        <span className="text-foreground/10 text-xl font-light">/</span>
        <span className="text-navy-primary">{t("allJobsTitle")}</span>
      </nav>

      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{t("allJobsTitle")}</h1>
        <p className="text-foreground/50 font-medium">Manage all job listings across the platform.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-24 text-center bg-card-background border border-foreground/5 rounded-[2.5rem]">
          <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
             <Briefcase className="w-8 h-8 text-foreground/20" />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">{t("noJobs")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const style = STATUS_STYLING[job.status] || STATUS_STYLING.DRAFT;
            return (
              <Link
                key={job.id}
                href={`/admin/review/${job.id}`}
                className="group block p-5 rounded-[2rem] bg-card-background border border-foreground/5 hover:border-navy-primary/20 hover:shadow-xl hover:shadow-navy-primary/5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                     <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center overflow-hidden shrink-0">
                        {job.employer.logoUrl ? (
                          <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-foreground/20" />
                        )}
                     </div>
                     <div className="min-w-0">
                      <h3 className="font-bold text-foreground group-hover:text-navy-primary transition-colors truncate">{job.title}</h3>
                      <p className="text-xs font-bold text-foreground/40 uppercase tracking-tight mt-1 truncate">
                        {job.employer.companyName} · {job.category} · {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 px-2 sm:px-0">
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${style.class}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${job.status === 'PENDING_REVIEW' ? 'animate-pulse' : ''}`} />
                      {style.label}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-navy-primary group-hover:border-navy-primary transition-all group-hover:translate-x-1 hidden sm:flex">
                       <ArrowRight className="w-3.5 h-3.5 text-foreground/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

