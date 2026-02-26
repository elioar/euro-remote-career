# CLAUDE.md — Euro Remote Career

## 1. Project Overview

**Euro Remote Career** is a curated remote and async job board for Europe (Tech, Design, Marketing, Product). Next.js 16 (App Router), React 19, TypeScript, Tailwind 4. Job data is in-memory (no DB); see `lib/demo-jobs.ts`. Framer Motion and Spline used for hero/UI.

## 2. Architecture Map

```
app/
  layout.tsx          # Root layout, fonts (Geist), metadata, ld+json
  page.tsx            # Home: Header, Hero, SplitIntent, CompanyLogos, HowItWorks, Categories, FeaturedJobs, EmployerTrustStrip, Footer
  globals.css         # Tailwind 4 entry; @theme inline for design tokens (--navy-primary, etc.)
  components/         # Shared UI (Header, Footer, Hero, HeroSearch, HeroSpline, FeaturedJobs, etc.)
  about/, contact/, terms/, privacy/   # Static/content pages
  jobs/
    page.tsx          # Jobs listing
    [slug]/page.tsx   # Job detail (async params, generateMetadata, getJobBySlug)
    not-found.tsx
  robots.ts, sitemap.ts
lib/
  demo-jobs.ts        # DemoJob type, DEMO_JOBS array, getJobBySlug(slug)
```

Entry: `app/page.tsx`. Data: `lib/demo-jobs.ts`. Path alias: `@/*` → project root.

## 3. Common Commands

| Action   | Command        |
|----------|----------------|
| Dev      | `npm run dev`  |
| Build    | `npm run build`|
| Start    | `npm run start`|
| Lint     | `npm run lint` |
| Typecheck| `npx tsc --noEmit` |

No test script; add one (e.g. Vitest) if you introduce tests.

## 4. Code Conventions

- **Server by default.** Add `"use client"` only for interactivity (state, events, browser APIs). Pages that only compose server components and fetch data should stay server.
- **Route params.** Next 16: `params` is a **Promise**. Use `const { slug } = await params` in page and `generateMetadata`.
- **Imports.** Prefer `@/` for app and lib (e.g. `@/app/components/Header`, `@/lib/demo-jobs`). Relative imports within the same route folder are fine (e.g. `./JobDetailContent`).
- **Job types.** Use `DemoJob` and `JobCategory` from `lib/demo-jobs.ts`; extend there if you add fields.
- **Images.** Only `images.unsplash.com` is allowed in `next.config.ts`. Add new remote hosts under `images.remotePatterns` for external images.

## 5. Gotchas & Warnings

- **params type:** Don’t use `params.slug` directly; use `const { slug } = await params`. Type page props as `{ params: Promise<{ slug: string }> }`.
- **New image domains:** External images (e.g. company logos) must have their host in `next.config.ts` → `images.remotePatterns`; otherwise Next Image will error.
- **Tailwind 4:** No `tailwind.config.js`. Theme and design tokens live in `app/globals.css` via `@theme inline` and `:root` (e.g. `--navy-primary`). Use these CSS variables in Tailwind where possible.
- **Spline (HeroSpline):** Client component; ensure Spline runtime is only loaded in client tree.

## 6. Git & Workflow

No repo-specific branch or commit conventions. Prefer clear commit messages and branch names (e.g. `feature/`, `fix/`).

## 7. Pointers (Progressive Disclosure)

- Job data and types: see `lib/demo-jobs.ts`.
- Image and remote patterns: see `next.config.ts`.
- Metadata and SEO (canonical, OG, Twitter, ld+json): see `app/layout.tsx` and `app/jobs/[slug]/page.tsx`.
- Design tokens and Tailwind: see `app/globals.css`.
