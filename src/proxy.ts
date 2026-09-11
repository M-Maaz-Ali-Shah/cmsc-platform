import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Optimistic (cookie-only) auth check — see src/lib/auth/dal.ts for the
// real, database-backed check that every admin page/action also performs.
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/admin/dashboard");
  const isLoginPage = path === "/admin/login";

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(token);

  if (isDashboard && !session) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/login"],
};
