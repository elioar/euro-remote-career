import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/dashboard", "/profile"];

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|el)/, "") || "/";
  return protectedPaths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + "/")
  );
}

export default async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session (updates cookies)
  const { user, supabaseResponse } = await updateSession(request);

  // 2. Protect routes — redirect unauthenticated users to /login
  const { pathname } = request.nextUrl;
  if (isProtectedPath(pathname) && !user) {
    const locale = pathname.startsWith("/el") ? "/el" : "";
    const loginUrl = new URL(`${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Run next-intl middleware (locale detection, prefix)
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
