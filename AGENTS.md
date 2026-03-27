# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 (App Router) job board site with no external services (no database, no API, no auth). All job data is hardcoded in `lib/demo-jobs.ts`.

### Services

| Service | Command | Port |
|---|---|---|
| Next.js dev server | `npm run dev` | 3000 |

### Commands

- **Dev server**: `npm run dev` (see `README.md`)
- **Lint**: `npm run lint` (runs ESLint; note: there are pre-existing lint warnings/errors in the codebase)
- **Build**: `npm run build`
- **TypeScript check**: `npx tsc --noEmit`

### Notes

- No environment variables are required. `NEXT_PUBLIC_SITE_URL` is optional and defaults to `https://euroremotecareer.com`.
- No Docker, no database, no external services needed.
- The dev server supports hot reloading out of the box.
