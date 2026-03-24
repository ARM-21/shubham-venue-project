import { NextResponse } from "next/server";
import { ROUTES } from "config/routes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
const SESSION_COOKIE_NAMES = ["shubham.sid", "sid"];

function getSessionCookie(request) {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) return cookie;
  }
  return null;
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
  const isOnboardingRoute = pathname === ROUTES.AUTH.ONBOARDING;

  const sessionCookie = getSessionCookie(request);
  const hasSession = Boolean(sessionCookie?.value);

  const user = hasSession ? await fetchCurrentUser(request) : null;
  const role = user?.role?.toLowerCase?.();
  const isAdmin = role === "admin";
  const isLoggedIn = Boolean(user);

  // Handle Onboarding Route
  if (isOnboardingRoute) {
    // User must be logged in
    if (!isLoggedIn) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    // User must not have completed onboarding
    if (user?.hasCompletedOnboarding) {
      const homeUrl = new URL(ROUTES.HOME, request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  if (isAdminRoute) {
    // Require a session cookie for admin pages in all cases.
    if (!hasSession) {
      const loginUrl = new URL(ROUTES.AUTH.ROOT, request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // Fail closed: if we cannot verify the user, redirect to login.
    if (!user) {
      const loginUrl = new URL(ROUTES.AUTH.ROOT, request.url);
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
    // If user hasn't completed onboarding, send them there
    if (!user?.hasCompletedOnboarding) {
      const onboardingUrl = new URL(ROUTES.AUTH.ONBOARDING, request.url);
      return NextResponse.redirect(onboardingUrl);
    }
    
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
