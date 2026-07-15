import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith("/api/auth");
  const isDevApi = pathname.startsWith("/api/dev");

  // Do not intercept NextAuth's own API routes or Dev utility routes
  if (isAuthApi || isDevApi) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });

  if (!token && !isPublicRoute && !isAuthApi) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const isOnboardingRoute = pathname === "/onboarding";
    const isProfileApi = pathname === "/api/users/profile";

    // Force non-onboarded users to the onboarding page
    if (!token.onboarded && !isOnboardingRoute && !isProfileApi && !isAuthApi) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
    }

    // Prevent onboarded users from going back to onboarding
    if (token.onboarded && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    // Redirect authenticated users away from public routes (like /login)
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
