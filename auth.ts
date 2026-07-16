import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, { databaseName: "messcheck" }),

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

        // Look up the user in MongoDB
        const client = await clientPromise;
        const db = client.db("messcheck");
        const user = await db.collection("users").findOne({ email });

        if (!user) {
          return null;
        }

        // Compare passwords
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
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

      if (trigger === "update" && session) {
        // Optimistically update the token from the client's update() call
        if (session.onboarded !== undefined) {
          token.onboarded = session.onboarded;
        }
        if (session.name !== undefined) {
          token.name = session.name;
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
        (session.user as any).onboarded = token.onboarded;
        (session.user as any).role = token.role || "student";
      }
      return session;
    },
  },
});
