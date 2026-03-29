"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Eye, UserCheck, Star, Users, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";

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

/* ─── CV Preview Modal ─── */
function CvPreviewModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const { fakeCv: cv } = app;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  // TODO: Replace with real Supabase signed URL when wiring real data
  // const supabase = createClient();
  // const { data } = await supabase.storage.from("cv-uploads").createSignedUrl(app.cvPath, 300);

  function handleDownload() {
    // Fake download: generate a text file from the fake CV data
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-card-background border border-foreground/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-primary/20 to-navy-primary/5 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-400">
                {app.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-foreground">{app.name}</h3>
              <p className="text-xs text-foreground/50">{app.role} · CV Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-primary text-white text-xs font-semibold hover:bg-navy-hover transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fake PDF page */}
        <div className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900/50 p-6 flex justify-center">
          <div className="w-full max-w-[595px] bg-white dark:bg-[#1a1a2e] rounded-lg shadow-lg p-10 min-h-[842px]">
            {/* Name & title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{app.name}</h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">{app.role}</p>

            {/* Contact bar */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 pb-4">
              <span>{cv.email}</span>
              <span>{cv.phone}</span>
              <span>{cv.location}</span>
            </div>

            {/* Summary */}
            <div className="mt-5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">Summary</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{cv.summary}</p>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Experience</h4>
              <div className="space-y-4">
                {cv.experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{exp.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company} · {exp.period}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">Education</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{cv.education}</p>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                    {skill}
                  </span>
                ))}
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
          <h3 className="text-lg font-bold text-foreground">Latest Applications</h3>
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
                {f.label}
                <span className={`ml-1 text-[10px] ${filter === f.key ? "text-white/60" : "text-foreground/30"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications list */}
        <div className="rounded-3xl bg-card-background border border-foreground/10 overflow-hidden shadow-sm divide-y divide-foreground/5">
          {paged.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users className="w-8 h-8 text-foreground/15 mx-auto mb-2" />
              <p className="text-foreground/50 text-sm">
                {filter === "all" ? "No applications yet." : `No ${filter} applications.`}
              </p>
              {filter === "all" && (
                <p className="text-foreground/30 text-xs mt-1">Applications will appear here when candidates apply to your jobs.</p>
              )}
            </div>
          ) : (
            paged.map((app) => (
              <div key={app.id} className="px-4 py-3 hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-primary/20 to-navy-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">
                      {app.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{app.name}</p>
                      {app.status === "new" && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-blue-400 font-medium truncate">{app.role}</p>
                    <p className="text-[11px] text-foreground/30 truncate mt-0.5">Applied to: {app.job}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${STATUS_BADGE[app.status].className}`}>
                        {STATUS_BADGE[app.status].label}
                      </span>
                      <span className="text-[10px] text-foreground/30">{app.time}</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 mt-2 ml-12">
                  {/* CV Preview / Download */}
                  <button
                    onClick={() => app.cvPath ? setViewingCv(app) : undefined}
                    disabled={!app.cvPath}
                    className={`p-1.5 rounded-md transition-colors ${
                      app.cvPath
                        ? "text-foreground/30 hover:text-navy-primary hover:bg-navy-primary/10"
                        : "text-foreground/15 cursor-not-allowed"
                    }`}
                    title={app.cvPath ? "View CV" : "No CV uploaded"}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  {app.status === "new" && (
                    <button
                      onClick={() => updateStatus(app.id, "reviewed")}
                      className="p-1.5 rounded-md text-foreground/30 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title="Mark as reviewed"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {app.status !== "shortlisted" && app.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(app.id, "shortlisted")}
                      className="p-1.5 rounded-md text-foreground/30 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Shortlist"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {app.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(app.id, "rejected")}
                      className="p-1.5 rounded-md text-foreground/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {app.status === "rejected" && (
                    <button
                      onClick={() => updateStatus(app.id, "new")}
                      className="p-1.5 rounded-md text-foreground/30 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title="Move back to New"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
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
          View All Applications
        </Link>
      </div>
    </>
  );
}
