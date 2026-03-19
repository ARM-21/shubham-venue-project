import { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "";
const SESSION_COOKIE_NAMES = ["shubham.sid", "sid"];

function getSessionCookie(request) {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) return cookie;
  }
  return null;
}

function isCrossOriginApi(request) {
  if (!API_BASE) return false;

  try {
    const apiUrl = new URL(API_BASE);
    return apiUrl.host !== request.nextUrl.host;
  } catch {
    return false;
  }
}

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

  const canEnforceSessionInMiddleware = !isCrossOriginApi(request);
  const sessionCookie = getSessionCookie(request);
  const hasSession = Boolean(sessionCookie?.value);

  const user = canEnforceSessionInMiddleware && hasSession ? await fetchCurrentUser(request) : null;
  const role = user?.role?.toLowerCase?.();
  const isAdmin = role === "admin";
  const isLoggedIn = Boolean(user);

  if (isAdminRoute) {
    if (canEnforceSessionInMiddleware && !hasSession) {
      const loginUrl = new URL(ROUTES.AUTH.ROOT, request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (canEnforceSessionInMiddleware && !isAdmin) {
      const homeUrl = new URL(ROUTES.HOME, request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  if (isAuthRoute && canEnforceSessionInMiddleware && isLoggedIn) {
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
