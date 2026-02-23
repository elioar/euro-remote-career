export type JobCategory = "Tech" | "Design" | "Marketing" | "Product";

export type DemoJob = {
  id: string;
  title: string;
  company: string;
  description: string;
  slug: string;
  category: JobCategory;
  location: string;
  async: boolean;
  salary?: string;
  applyUrl: string;
  /** Short summary for meta description (~150 chars). */
  summary?: string;
  /** Optional requirements section (plain text or bullet points). */
  requirements?: string;
  /** Optional benefits section. */
  benefits?: string;
  /** ISO date string e.g. "2025-02-01". */
  datePosted?: string;
  /** Optional e.g. "EU preferred", "Americas". */
  timezone?: string;
  /** Optional e.g. "Senior", "Mid-level". */
  seniority?: string;
};

export const DEMO_JOBS: DemoJob[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Tech Co",
    description:
      "Build modern web apps with React and TypeScript. Fully remote, EU timezone-friendly. Strong ownership and async communication.\n\nYou'll work with the product and design teams to ship features end-to-end. We value clear documentation and async-first collaboration.",
    slug: "senior-frontend-engineer",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€70k–90k",
    applyUrl: "https://example.com/apply/1",
    summary: "Senior Frontend Engineer at Tech Co. React, TypeScript, remote, EU-friendly. Apply on company site.",
    requirements:
      "5+ years frontend experience. Strong React and TypeScript. Experience with async teams and written communication.",
    benefits: "Remote-first, flexible hours, learning budget, health insurance.",
    datePosted: "2025-02-15",
    timezone: "EU preferred",
    seniority: "Senior",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Design Studio",
    description:
      "Own product design for a B2B SaaS. Async-first team, Figma, user research. EU or Americas timezone.\n\nYou'll own the design system and key flows, working closely with engineering and product in an async workflow.",
    slug: "product-designer",
    category: "Design",
    location: "Remote",
    async: true,
    salary: "€55k–75k",
    applyUrl: "https://example.com/apply/2",
    datePosted: "2025-02-10",
    timezone: "EU or Americas",
  },
  {
    id: "3",
    title: "Content Marketing Lead",
    company: "Growth Inc",
    description: "Lead content strategy and SEO. Remote, flexible hours. Blog, newsletters, and partnerships.",
    slug: "content-marketing-lead",
    category: "Marketing",
    location: "Remote",
    async: false,
    salary: "€60k–80k",
    applyUrl: "https://example.com/apply/3",
  },
  {
    id: "4",
    title: "Backend Engineer",
    company: "DataFlow",
    description: "Design and maintain APIs and data pipelines. Remote-first. Python or Go. Strong written communication.",
    slug: "backend-engineer",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€75k–95k",
    applyUrl: "https://example.com/apply/4",
  },
  {
    id: "5",
    title: "Product Manager",
    company: "Product Labs",
    description: "Drive roadmap and discovery for a developer tool. Remote, EU. Async updates and clear documentation.",
    slug: "product-manager",
    category: "Product",
    location: "Remote",
    async: true,
    salary: "€65k–85k",
    applyUrl: "https://example.com/apply/5",
  },
  {
    id: "6",
    title: "UX Researcher",
    company: "Design Studio",
    description: "Run user interviews and usability studies. Remote. Collaborate async with design and product.",
    slug: "ux-researcher",
    category: "Design",
    location: "Remote",
    async: true,
    applyUrl: "https://example.com/apply/6",
  },
  {
    id: "7",
    title: "Growth Marketing Manager",
    company: "Growth Inc",
    description: "Paid acquisition, landing pages, and conversion. Remote. Data-driven, experiment-focused.",
    slug: "growth-marketing-manager",
    category: "Marketing",
    location: "Remote",
    async: false,
    salary: "€58k–78k",
    applyUrl: "https://example.com/apply/7",
  },
  {
    id: "8",
    title: "Full-Stack Developer",
    company: "Tech Co",
    description: "End-to-end feature development. React and Node. Remote, EU. Occasional sync for planning.",
    slug: "full-stack-developer",
    category: "Tech",
    location: "Remote",
    async: false,
    salary: "€68k–88k",
    applyUrl: "https://example.com/apply/8",
  },
];

export function getJobBySlug(slug: string): DemoJob | undefined {
  return DEMO_JOBS.find((j) => j.slug === slug);
}
