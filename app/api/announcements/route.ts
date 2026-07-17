import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    // Fetch user to get their college and hostel
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch announcements for their college and hostel
    const announcements = await db.collection("announcements")
      .find({ college: user.college, hostel: user.hostel })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const lastReadAt = user.lastReadAnnouncementsAt || new Date(0);
    const unreadCount = announcements.filter((a) => new Date(a.createdAt) > lastReadAt).length;

    return NextResponse.json({ 
      announcements,
      hostel: user.hostel,
      college: user.college,
      unreadCount,
      lastReadAt
    });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "mess_secretary" && userRole !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only mess secretaries or supreme leaders can post announcements" }, { status: 403 });
    }

    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }
    if (typeof title !== "string" || title.length > 100) {
      return NextResponse.json({ error: "Title must be a string up to 100 characters" }, { status: 400 });
    }
    if (typeof content !== "string" || content.length > 500) {
      return NextResponse.json({ error: "Content must be a string up to 500 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    // Fetch user to get their college and hostel
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newAnnouncement = {
      title,
      content,
      authorName: user.name || session.user.name,
      authorEmail: session.user.email,
      college: user.college,
      hostel: user.hostel,
      createdAt: new Date(),
    };

    const result = await db.collection("announcements").insertOne(newAnnouncement);

    return NextResponse.json({ success: true, announcement: { ...newAnnouncement, _id: result.insertedId } });
  } catch (error) {
    console.error("Failed to post announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
