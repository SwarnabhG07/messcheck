import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { lastReadAnnouncementsAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark announcements as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
