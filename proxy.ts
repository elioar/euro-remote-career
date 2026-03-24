import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/dashboard", "/profile"];
const employerPaths = ["/dashboard/post-job", "/dashboard/my-jobs", "/dashboard/edit-job"];
const adminPaths = ["/admin"];

function getPathWithoutLocale(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/(en|el)/, "") || "/";
  return withoutLocale;
}

function isProtectedPath(path: string): boolean {
  return protectedPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  );
}

function getRequiredRole(path: string): "EMPLOYER" | "ADMIN" | null {
  if (adminPaths.some((p) => path.startsWith(p))) return "ADMIN";
  if (employerPaths.some((p) => path.startsWith(p))) return "EMPLOYER";
  return null;
}

export default async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session (updates cookies)
  const { user, supabaseResponse } = await updateSession(request);

  // 2. Protect routes — redirect unauthenticated users to /login
  const { pathname } = request.nextUrl;
  const path = getPathWithoutLocale(pathname);

  if (isProtectedPath(path) && !user) {
    const locale = pathname.startsWith("/el") ? "/el" : "";
    const loginUrl = new URL(`${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based route protection
  const ADMIN_EMAILS = ["euroremotecareer@gmail.com", "mycomments2026@gmail.com"];
  const requiredRole = getRequiredRole(path);
  if (requiredRole && user) {
    const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
    const userRole = isAdmin ? "ADMIN" : (user.user_metadata?.role as string | undefined);
    if (userRole !== requiredRole) {
      const locale = pathname.startsWith("/el") ? "/el" : "";
      const dashboardUrl = new URL(`${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 4. Run next-intl middleware (locale detection, prefix)
  const intlResponse = intlMiddleware(request);

  // Merge Supabase cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
