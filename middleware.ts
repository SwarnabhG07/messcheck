import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith("/api/auth");

  // Do not intercept NextAuth's own API routes
  if (isAuthApi) {
    return NextResponse.next();
  }

  const isLoggedIn = !!session;

  if (!isLoggedIn && !isPublicRoute && !isAuthApi) {
    const loginUrl = new URL("/login", nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    const token = session.user as any;
    const isOnboardingRoute = pathname === "/onboarding";
    const isProfileApi = pathname === "/api/users/profile";

    // Force non-onboarded users to the onboarding page
    if (!token.onboarded && !isOnboardingRoute && !isProfileApi && !isAuthApi) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl.origin));
    }

    // Prevent onboarded users from going back to onboarding
    if (token.onboarded && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    // Redirect authenticated users away from public routes (like /login)
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
