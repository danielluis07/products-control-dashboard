import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const LOGIN_ROUTE = "/login";
const ROOT_ROUTE = "/";
const REGISTER_ROUTE = "/register";
const DASHBOARD_ROUTE = "/dashboard/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    if (
      pathname === ROOT_ROUTE ||
      pathname === LOGIN_ROUTE ||
      pathname === REGISTER_ROUTE
    ) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }
  }

  if (!sessionCookie) {
    if (pathname === ROOT_ROUTE || pathname === REGISTER_ROUTE) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }

    if (pathname.startsWith("/dashboard")) {
      const searchParams = new URLSearchParams();
      searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(
        new URL(`${LOGIN_ROUTE}?${searchParams.toString()}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
