import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const LOGIN_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  if (pathname.startsWith(LOGIN_ROUTE) && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !sessionCookie) {
    const searchParams = new URLSearchParams();
    searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(
      new URL(`${LOGIN_ROUTE}?${searchParams.toString()}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
