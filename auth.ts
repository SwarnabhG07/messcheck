import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/app/lib/rateLimit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, { databaseName: "messcheck" }),
  trustHost: true,

  // Use JWT sessions (required when using Credentials provider)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom auth pages
  pages: {
    signIn: "/login",
  },

  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // Email + Password
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          return null;
        }

        const cleanEmail = email.trim().toLowerCase();

        // Rate limit failed login attempts (10 per 15 minutes per email)
        if (!checkRateLimit(`login_${cleanEmail}`, 10, 15 * 60 * 1000)) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        try {
          const client = await clientPromise;
          const db = client.db("messcheck");
          const user = await db.collection("users").findOne({
            email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (err) {
          console.error("Auth authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        try {
          // Fetch user from DB to get their onboarded status on initial sign in
          const client = await clientPromise;
          const db = client.db("messcheck");
          const dbUser = await db.collection("users").findOne({ email: user.email });
          if (dbUser) {
            token.onboarded = dbUser.onboarded || false;
            token.role = dbUser.role || "student";
          }
        } catch (error) {
          console.error("Error in jwt callback db fetch:", error);
          // Don't throw, just let them login without onboarded status
        }
      }

      if (trigger === "update") {
        // Securely fetch the latest data from the DB instead of trusting client payload
        try {
          const client = await clientPromise;
          const db = client.db("messcheck");
          const dbUser = await db.collection("users").findOne({ email: token.email });
          if (dbUser) {
            token.onboarded = dbUser.onboarded || false;
            token.name = dbUser.name || token.name;
            token.role = dbUser.role || "student";
          }
        } catch (error) {
          console.error("Error verifying update from DB:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        if (token.name) {
          session.user.name = token.name;
        }
        
        try {
          const client = await clientPromise;
          const db = client.db("messcheck");
          const dbUser = await db.collection("users").findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).role = dbUser.role || "student";
            (session.user as any).onboarded = dbUser.onboarded || false;
          } else {
            (session.user as any).role = token.role || "student";
            (session.user as any).onboarded = token.onboarded || false;
          }
        } catch (error) {
          console.error("Error refreshing role in session callback:", error);
          (session.user as any).role = token.role || "student";
          (session.user as any).onboarded = token.onboarded || false;
        }
      }
      return session;
    },
  },
});
