import { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";

const SESSION_COOKIE_NAME = "shubham.sid";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "";

async function fetchCurrentUser(request) {
  try {
    const profileUrl = new URL(ROUTES.API.PROFILE.ME, API_BASE || request.url);
    const res = await fetch(profileUrl, {
      headers: { cookie: request.headers.get("cookie") || "" },
      credentials: "include",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || data || null;
  } catch (err) {
    console.error("middleware profile fetch failed", err);
    return null;
  }
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const isAdminRoute = pathname.startsWith(ROUTES.ADMIN.ROOT);
  const isAuthRoute = pathname.startsWith(ROUTES.AUTH.ROOT);

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSession = Boolean(sessionCookie?.value);

  const user = hasSession ? await fetchCurrentUser(request) : null;
  const role = user?.role?.toLowerCase?.();
  const isAdmin = role === "admin";
  const isLoggedIn = Boolean(user);

  if (isAdminRoute) {
    if (!hasSession) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      const homeUrl = new URL(ROUTES.HOME, request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  if (isAuthRoute && isLoggedIn) {
    const target = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.HOME;
    const redirectUrl = new URL(target, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
  ],
};
