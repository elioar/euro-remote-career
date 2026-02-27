export type JobCategory = "Tech" | "Design" | "Marketing" | "Product";

export type DemoJob = {
  id: string;
  title: string;
  company: string;
  /** Optional URL to company logo (e.g. for display in cards). */
  companyLogo?: string;
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
    companyLogo: "https://ui-avatars.com/api/?name=Tech+Co&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Build modern web apps with React and TypeScript. Fully remote, EU timezone-friendly — strong ownership and async communication.\n\nYou'll work with the product and design teams to ship features end-to-end. We value clear documentation and async-first collaboration. 🚀",
    slug: "senior-frontend-engineer",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€70k–90k",
    applyUrl: "https://example.com/apply/1",
    summary: "Senior Frontend Engineer at Tech Co. React, TypeScript, remote, EU-friendly. Apply on company site.",
    requirements:
      "5+ years frontend experience. Strong React and TypeScript. Experience with async teams and written communication.",
    benefits: "Remote-first 🌍 · Flexible hours ⏰ · Learning budget 📚 · Health insurance 💙",
    datePosted: "2025-02-15",
    timezone: "EU preferred",
    seniority: "Senior",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Design Studio",
    companyLogo: "https://ui-avatars.com/api/?name=Design+Studio&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Own product design for a B2B SaaS. Async-first team, Figma, user research — EU or Americas timezone.\n\nYou'll own the design system and key flows, working closely with engineering and product. Great fit if you love clean UI and clear communication. ✨",
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
    companyLogo: "https://ui-avatars.com/api/?name=Growth+Inc&background=0E1A2B&color=fff&size=128&format=png",
    description: "Lead content strategy and SEO. Remote, flexible hours — blog, newsletters, and partnerships. You'll own the voice and growth story. 📈",
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
    companyLogo: "https://ui-avatars.com/api/?name=DataFlow&background=0E1A2B&color=fff&size=128&format=png",
    description: "Design and maintain APIs and data pipelines. Remote-first — Python or Go, strong written communication. Ship impact without the commute. 🔧",
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
    companyLogo: "https://ui-avatars.com/api/?name=Product+Labs&background=0E1A2B&color=fff&size=128&format=png",
    description: "Drive roadmap and discovery for a developer tool. Remote, EU — async updates and clear documentation. Own the “what” and “why.” 📋",
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
    companyLogo: "https://ui-avatars.com/api/?name=Design+Studio&background=0E1A2B&color=fff&size=128&format=png",
    description: "Run user interviews and usability studies. Remote — collaborate async with design and product. Turn insights into better experiences. 🎯",
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
    companyLogo: "https://ui-avatars.com/api/?name=Growth+Inc&background=0E1A2B&color=fff&size=128&format=png",
    description: "Paid acquisition, landing pages, and conversion. Remote — data-driven and experiment-focused. Test, learn, scale. 📊",
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
    companyLogo: "https://ui-avatars.com/api/?name=Tech+Co&background=0E1A2B&color=fff&size=128&format=png",
    description: "End-to-end feature development. React and Node. Remote, EU — occasional sync for planning. Build it, ship it, own it. ⚡",
    slug: "full-stack-developer",
    category: "Tech",
    location: "Remote",
    async: false,
    salary: "€68k–88k",
    applyUrl: "https://example.com/apply/8",
  },
  // Greek companies
  {
    id: "9",
    title: "Senior Software Engineer",
    company: "Wolt",
    companyLogo: "https://ui-avatars.com/api/?name=Wolt&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Build and scale the platform that connects millions of customers with restaurants and stores. Remote-friendly, EU — Kotlin, React, strong ownership.\n\nYou'll work on core services and partner tools. We value async communication and clear documentation. 🚀",
    slug: "senior-software-engineer-wolt",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€75k–95k",
    applyUrl: "https://careers.wolt.com",
    summary: "Senior Software Engineer at Wolt. Remote, EU. Apply on company site.",
    datePosted: "2025-02-18",
    timezone: "EU",
  },
  {
    id: "10",
    title: "Product Designer",
    company: "e-food",
    companyLogo: "https://ui-avatars.com/api/?name=e-food&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Shape the food delivery experience for millions of users in Greece. Remote or hybrid Athens — Figma, user research, cross-functional collaboration.\n\nOwn design for key product areas. We work async where possible with regular alignment. ✨",
    slug: "product-designer-efood",
    category: "Design",
    location: "Remote",
    async: false,
    salary: "€50k–70k",
    applyUrl: "https://www.efood.gr/careers",
    datePosted: "2025-02-14",
    timezone: "Greece preferred",
  },
  {
    id: "11",
    title: "Backend Engineer",
    company: "Plaisio",
    companyLogo: "https://ui-avatars.com/api/?name=Plaisio&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Develop and maintain e-commerce and internal systems. Remote in Greece — .NET or Node, databases, APIs.\n\nJoin the tech team behind one of Greece's leading electronics and tech retailers. Flexible hours, remote-first options. 🔧",
    slug: "backend-engineer-plaisio",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€45k–65k",
    applyUrl: "https://www.plaisio.gr/careers",
    datePosted: "2025-02-12",
    timezone: "Greece",
  },
  {
    id: "12",
    title: "Data Engineer",
    company: "Scroutz",
    companyLogo: "https://ui-avatars.com/api/?name=Scroutz&background=0E1A2B&color=fff&size=128&format=png",
    description:
      "Build data pipelines and analytics for price comparison and product discovery. Remote, EU — Python, SQL, cloud infrastructure.\n\nHelp millions of users find the best deals. Async-friendly team, focus on quality and ownership. 📊",
    slug: "data-engineer-scroutz",
    category: "Tech",
    location: "Remote",
    async: true,
    salary: "€55k–75k",
    applyUrl: "https://www.scroutz.gr/careers",
    datePosted: "2025-02-10",
    timezone: "EU / Greece",
  },
];

export function getJobBySlug(slug: string): DemoJob | undefined {
  return DEMO_JOBS.find((j) => j.slug === slug);
}
