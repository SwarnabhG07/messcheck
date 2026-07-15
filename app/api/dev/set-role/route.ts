import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    // SECURITY: Ensure this route only runs in local development!
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Forbidden: Route only active in development mode" }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const result = await db.collection("users").updateOne(
      { email },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `User ${email} updated to role ${role}` });
  } catch (error) {
    console.error("Failed to set role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
