import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // We add the actual providers in auth.ts to keep this edge-safe
  callbacks: {
    session({ session, token }) {
      if (session.user && token) {
        (session.user as any).onboarded = token.onboarded;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnboardingRoute = nextUrl.pathname === "/onboarding";
      const isProfileApi = nextUrl.pathname === "/api/users/profile";
      const publicRoutes = ["/login", "/signup"];
      const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthApi) return true;

      if (!isLoggedIn) {
        if (isPublicRoute) return true;
        return false; // NextAuth will automatically redirect to pages.signIn
      }

      if (isLoggedIn) {
        const onboarded = (auth.user as any)?.onboarded;

        // Force non-onboarded users to the onboarding page
        if (!onboarded && !isOnboardingRoute && !isProfileApi && !isAuthApi) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }

        // Prevent onboarded users from going back to onboarding
        if (onboarded && isOnboardingRoute) {
          return Response.redirect(new URL("/", nextUrl));
        }

        // Redirect authenticated users away from public routes (like /login)
        if (isPublicRoute) {
          return Response.redirect(new URL("/", nextUrl));
        }

        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
