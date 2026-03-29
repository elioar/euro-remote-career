import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clock, ArrowRight, Building2, Tag } from "lucide-react";

export default async function ReviewQueuePage() {
  const t = await getTranslations("AdminReview");

  const jobs = await prisma.job.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      employer: {
        select: { companyName: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{t("pageTitle")}</h1>
        <p className="text-foreground/50 font-medium">Review and moderate incoming job listings to ensure content quality.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-24 text-center bg-card-background border border-foreground/5 rounded-[2.5rem]">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
             <Clock className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">{t("noJobs")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/admin/review/${job.id}`}
              className="group block p-6 rounded-[2rem] bg-card-background border border-foreground/5 hover:border-navy-primary/20 hover:shadow-xl hover:shadow-navy-primary/5 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center overflow-hidden shrink-0">
                      {job.employer.logoUrl ? (
                        <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-foreground/20" />
                      )}
                   </div>
                   <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-navy-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                       <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-tight flex items-center gap-1.5 shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.employer.companyName}
                       </span>
                       <span className="w-1 h-1 bg-foreground/10 rounded-full shrink-0" />
                       <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-tight flex items-center gap-1.5 truncate">
                          <Tag className="w-3.5 h-3.5" />
                          {job.category}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Submitted</p>
                     <p className="text-xs font-bold text-foreground/60">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Pending
                  </div>
                  <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-navy-primary group-hover:border-navy-primary transition-all group-hover:translate-x-1">
                     <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

