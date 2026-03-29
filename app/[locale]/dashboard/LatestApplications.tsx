"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Eye, UserCheck, Star, Users, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type AppStatus = "new" | "reviewed" | "shortlisted" | "rejected";
type FilterKey = "all" | AppStatus;

type FakeCv = {
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: { title: string; company: string; period: string; desc: string }[];
  education: string;
  skills: string[];
};

type Application = {
  id: number;
  name: string;
  role: string;
  job: string;
  time: string;
  status: AppStatus;
  cvPath: string | null;
  fakeCv: FakeCv;
};

const INITIAL_APPS: Application[] = [
  { id: 1, name: "Maria Papadopoulou", role: "Senior Frontend Engineer", job: "Senior Frontend Engineer 2", time: "2h ago", status: "new", cvPath: "demo/maria_papadopoulou_cv.pdf",
    fakeCv: { email: "maria.p@email.com", phone: "+30 694 123 4567", location: "Athens, Greece", summary: "Frontend engineer with 7+ years building performant React applications. Passionate about design systems, accessibility, and developer experience.", experience: [{ title: "Senior Frontend Engineer", company: "TechCorp EU", period: "2021 – Present", desc: "Led migration from Vue to React/Next.js. Built component library used across 4 product teams." }, { title: "Frontend Developer", company: "StartupHub", period: "2018 – 2021", desc: "Developed customer-facing SPA with React, Redux, and TypeScript." }], education: "BSc Computer Science — University of Athens, 2017", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "GraphQL"] }},
  { id: 2, name: "Alexandros Nikos", role: "Product Designer", job: "Senior Frontend Engineer 2", time: "5h ago", status: "new", cvPath: "demo/alexandros_nikos_cv.pdf",
    fakeCv: { email: "alex.nikos@email.com", phone: "+30 697 555 1234", location: "Thessaloniki, Greece", summary: "Product designer with 5 years of experience in B2B SaaS. Strong focus on user research, prototyping, and design systems.", experience: [{ title: "Product Designer", company: "DesignStudio", period: "2020 – Present", desc: "Designed end-to-end flows for enterprise dashboard used by 50k+ users." }, { title: "UI/UX Designer", company: "AgencyX", period: "2018 – 2020", desc: "Created visual designs and prototypes for client projects across fintech and healthtech." }], education: "MA Interaction Design — Aristotle University, 2018", skills: ["Figma", "Prototyping", "User Research", "Design Systems", "HTML/CSS", "Framer"] }},
  { id: 3, name: "Sofia Karagianni", role: "Marketing Lead", job: "Test Job", time: "1d ago", status: "reviewed", cvPath: "demo/sofia_karagianni_cv.pdf",
    fakeCv: { email: "sofia.k@email.com", phone: "+30 698 222 3344", location: "Remote – EU", summary: "Growth-focused marketing lead with 6 years in B2B tech. Expert in content strategy, SEO, and demand generation.", experience: [{ title: "Marketing Lead", company: "SaaSGrowth", period: "2021 – Present", desc: "Grew organic traffic 3x and built content engine generating 200+ MQLs/month." }, { title: "Content Strategist", company: "ContentCo", period: "2018 – 2021", desc: "Managed editorial calendar and SEO strategy for 4 B2B clients." }], education: "BSc Marketing — Athens University of Economics, 2017", skills: ["SEO", "Content Strategy", "Google Analytics", "HubSpot", "Paid Ads", "Copywriting"] }},
  { id: 4, name: "Dimitris Vlachos", role: "Full Stack Developer", job: "Test Job", time: "2d ago", status: "reviewed", cvPath: null,
    fakeCv: { email: "dimitris.v@email.com", phone: "+30 693 777 8899", location: "Patras, Greece", summary: "Full-stack developer with 4 years of experience in Node.js and React.", experience: [{ title: "Full Stack Developer", company: "WebDev Co", period: "2021 – Present", desc: "Built and maintained multiple Next.js applications with PostgreSQL and Prisma." }], education: "BSc Software Engineering — University of Patras, 2019", skills: ["React", "Node.js", "PostgreSQL", "Prisma", "Docker", "TypeScript"] }},
  { id: 5, name: "Elena Martins", role: "Senior Frontend Engineer", job: "Senior Frontend Engineer 2", time: "3d ago", status: "shortlisted", cvPath: "demo/elena_martins_cv.pdf",
    fakeCv: { email: "elena.m@email.com", phone: "+351 912 345 678", location: "Lisbon, Portugal", summary: "Senior frontend engineer with 8 years of experience. Specialized in performance optimization and micro-frontends.", experience: [{ title: "Senior Frontend Engineer", company: "FinTech Pro", period: "2019 – Present", desc: "Architected micro-frontend system serving 1M+ users. Reduced bundle size by 40%." }, { title: "Frontend Engineer", company: "MediaGroup", period: "2016 – 2019", desc: "Built responsive media player and content management interfaces." }], education: "MSc Computer Engineering — University of Lisbon, 2016", skills: ["React", "TypeScript", "Webpack", "Performance", "Micro-frontends", "Testing"] }},
  { id: 6, name: "Nikos Papadimitriou", role: "Backend Engineer", job: "Test Job", time: "4d ago", status: "new", cvPath: "demo/nikos_papadimitriou_cv.pdf",
    fakeCv: { email: "nikos.p@email.com", phone: "+30 691 444 5566", location: "Heraklion, Greece", summary: "Backend engineer with 3 years building scalable APIs and microservices with Go and Python.", experience: [{ title: "Backend Engineer", company: "CloudScale", period: "2022 – Present", desc: "Designed event-driven microservices handling 10k+ requests/sec." }, { title: "Junior Backend Developer", company: "DataFlow", period: "2021 – 2022", desc: "Developed Python APIs and ETL pipelines for analytics platform." }], education: "BSc Computer Science — University of Crete, 2021", skills: ["Go", "Python", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes"] }},
  { id: 7, name: "Anna Georgiou", role: "UX Researcher", job: "Senior Frontend Engineer 2", time: "5d ago", status: "rejected", cvPath: null,
    fakeCv: { email: "anna.g@email.com", phone: "+30 695 888 9900", location: "Athens, Greece", summary: "UX researcher with 4 years conducting qualitative and quantitative user studies for product teams.", experience: [{ title: "UX Researcher", company: "ProductLab", period: "2021 – Present", desc: "Led 20+ usability studies and A/B tests improving conversion by 25%." }], education: "MSc Human-Computer Interaction — NTUA, 2019", skills: ["User Interviews", "Usability Testing", "A/B Testing", "Survey Design", "Figma", "Miro"] }},
];

const STATUS_BADGE: Record<AppStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-500" },
  reviewed: { label: "Reviewed", className: "bg-amber-500/10 text-amber-500" },
  shortlisted: { label: "Shortlisted", className: "bg-emerald-500/10 text-emerald-500" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400" },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "reviewed", label: "Reviewed" },
  { key: "shortlisted", label: "Top" },
];

/* ─── Modern CV Preview Modal ─── */
function CvPreviewModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const { fakeCv: cv } = app;
  const t = useTranslations("Dashboard");

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function handleDownload() {
    const lines = [
      app.name, app.role, "",
      `Email: ${cv.email}  |  Phone: ${cv.phone}  |  Location: ${cv.location}`, "",
      "SUMMARY", cv.summary, "",
      "EXPERIENCE",
      ...cv.experience.flatMap((e) => [`${e.title} — ${e.company} (${e.period})`, e.desc, ""]),
      "EDUCATION", cv.education, "",
      "SKILLS", cv.skills.join("  ·  "),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.name.replace(/\s+/g, "_")}_CV.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-primary/20 backdrop-blur-md transition-opacity" />
      
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[32px] bg-white dark:bg-[#0f111a] shadow-2xl shadow-black/40 border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-foreground/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-navy-primary flex items-center justify-center shadow-lg shadow-navy-primary/20">
              <span className="text-lg font-black text-white uppercase">
                {app.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">{app.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">{app.role}</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span className="text-xs text-foreground/40 italic">{t("cvPreview")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white text-xs font-bold hover:bg-navy-hover transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              {t("downloadCV")}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CV Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fc] dark:bg-[#0a0b10] p-6 md:p-12 flex justify-center custom-scrollbar">
          <div className="w-full max-w-[800px] bg-white dark:bg-[#151825] rounded-[24px] shadow-2xl shadow-black/10 border border-foreground/5 p-10 md:p-16 relative overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-navy-primary/5 rounded-full -mr-16 -mt-16 blur-3xl text-emerald-500" />
            
            {/* CV Header */}
            <div className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/5 pb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">{app.name}</h1>
                <p className="text-lg font-bold text-navy-primary mb-6">{app.role}</p>
                <div className="flex flex-wrap gap-4 text-sm text-foreground/50 font-medium">
                  <span className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-primary" /> {cv.email}
                  </span>
                  <span className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {cv.phone}
                  </span>
                  <span className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> {cv.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Left Column (Main Content) */}
              <div className="md:col-span-8 space-y-12">
                {/* Summary Section */}
                <section>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-navy-primary/60 mb-4 flex items-center gap-3">
                    {t("summary")} <div className="h-px flex-1 bg-navy-primary/10" />
                  </h4>
                  <p className="text-base leading-relaxed text-foreground/80 font-medium italic">
                    "{cv.summary}"
                  </p>
                </section>

                {/* Experience Section */}
                <section>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-navy-primary/60 mb-8 flex items-center gap-3">
                    {t("professionalExperience")} <div className="h-px flex-1 bg-navy-primary/10" />
                  </h4>
                  <div className="space-y-10 relative pl-4 border-l-2 border-foreground/5">
                    {cv.experience.map((exp, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#151825] border-2 border-blue-500 shadow-sm group-hover:scale-125 transition-transform" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                          <h5 className="font-black text-foreground text-lg">{exp.title}</h5>
                          <span className="text-[11px] font-black bg-navy-primary/5 text-navy-primary px-3 py-1 rounded-full uppercase">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-navy-primary mb-3">{exp.company}</p>
                        <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                          {exp.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="md:col-span-4 space-y-12">
                {/* Skills Section */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-5">
                    {t("expertise")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-foreground/5 text-foreground/70 text-[11px] font-bold border border-foreground/5 hover:bg-navy-primary/10 hover:text-navy-primary hover:border-navy-primary/20 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Education Section */}
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-5">
                    {t("education")}
                  </h4>
                  <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 text-sm">
                    <p className="font-bold text-foreground mb-1 leading-snug">{cv.education}</p>
                    <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-tighter">Graduated with Honors</p>
                  </div>
                </section>

                {/* Footer Insight */}
                <div className="pt-8 mt-auto border-t border-dashed border-foreground/10 px-2">
                   <p className="text-[10px] text-foreground/30 leading-relaxed font-medium">
                    {t("verifiedProfile")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LatestApplications() {
  const t = useTranslations("Dashboard");
  const [apps, setApps] = useState(INITIAL_APPS);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [viewingCv, setViewingCv] = useState<Application | null>(null);
  const perPage = 4;

  useEffect(() => { setPage(1); }, [filter]);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const newCount = apps.filter((a) => a.status === "new").length;

  function updateStatus(id: number, status: AppStatus) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const closeCv = useCallback(() => setViewingCv(null), []);

  return (
    <>
      {viewingCv && <CvPreviewModal app={viewingCv} onClose={closeCv} />}

      <div className="sticky top-24">
        {/* Header with unread count */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold text-foreground">{t("applications")}</h3>
          {newCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
              {newCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? apps.length : apps.filter((a) => a.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? "bg-navy-primary text-white"
                    : "bg-section-muted text-foreground/50 hover:text-foreground"
                }`}
              >
                {t(`filters.${f.key}`)}
                <span className={`ml-1 text-[10px] ${filter === f.key ? "text-white/60" : "text-foreground/30"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications list */}
        <div className="space-y-3">
          {paged.length === 0 ? (
            <div className="rounded-3xl bg-card-background border border-foreground/10 px-5 py-10 text-center shadow-sm">
              <Users className="w-8 h-8 text-foreground/15 mx-auto mb-2" />
              <p className="text-foreground/50 text-sm">
                {t("noFilteredApplications", { status: t(`filters.${filter}`).toLowerCase() })}
              </p>
              {filter === "all" && (
                <p className="text-foreground/30 text-xs mt-1 px-4">{t("appsDescription")}</p>
              )}
            </div>
          ) : (
            paged.map((app) => (
              <div 
                key={app.id} 
                className="group relative rounded-3xl bg-card-background border border-foreground/10 p-4 hover:border-navy-primary/30 hover:shadow-lg hover:shadow-navy-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-primary/10 to-navy-primary/5 border border-foreground/5 flex items-center justify-center">
                      <span className="text-sm font-black text-navy-primary uppercase">
                        {app.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    {app.status === "new" && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 shadow-sm animate-pulse" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                       <h4 className="font-bold text-foreground text-[15px] truncate group-hover:text-navy-primary transition-colors">
                        {app.name}
                      </h4>
                      <span className="text-[10px] font-bold text-foreground/20 whitespace-nowrap uppercase tracking-tighter">
                        {app.time}
                      </span>
                    </div>
                    
                    <p className="text-xs font-semibold text-navy-primary truncate mt-0.5">{app.role}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${STATUS_BADGE[app.status].className}`}>
                        {t(`status.${app.status}`)}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-medium truncate italic max-w-[120px]">
                        for {app.job}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions (Visible on hover on desktop, always on mobile) */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => app.cvPath ? setViewingCv(app) : undefined}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        app.cvPath
                          ? "bg-navy-primary/5 text-navy-primary hover:bg-navy-primary hover:text-white"
                          : "bg-foreground/5 text-foreground/20 cursor-not-allowed"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t("actions.viewCV")}
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "shortlisted")}
                      className={`p-1.5 rounded-xl transition-all ${
                         app.status === "shortlisted" 
                         ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                         : "bg-foreground/5 text-foreground/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                      }`}
                      title="Shortlist"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {app.status === "new" && (
                      <button
                        onClick={() => updateStatus(app.id, "reviewed")}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-blue-500/10 hover:text-blue-500 transition-all font-bold text-[11px] px-3"
                      >
                        {t("actions.markReviewed")}
                      </button>
                    )}
                    {app.status !== "rejected" ? (
                      <button
                        onClick={() => updateStatus(app.id, "rejected")}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title={t("actions.reject")}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(app.id, "new")}
                        className="p-1.5 rounded-xl bg-foreground/5 text-foreground/30 hover:bg-blue-500/10 hover:text-blue-500 transition-all text-[11px] font-bold px-3"
                      >
                        {t("actions.restore")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-foreground/30">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded-md text-[11px] font-medium transition-colors ${
                    page === p
                      ? "bg-navy-primary text-white"
                      : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* View all link */}
        <Link
          href="/dashboard"
          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-section-muted border border-foreground/10 text-foreground/60 text-xs font-semibold hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          {t("viewAllApplications")}
        </Link>
      </div>
    </>
  );
}
