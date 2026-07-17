import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`admin_${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many admin requests. Please try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only supreme leaders can access this" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const secretaries = await db.collection("users")
      .find({ role: "mess_secretary" })
      .project({ _id: 1, name: 1, email: 1, college: 1, hostel: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({ secretaries });
  } catch (error) {
    console.error("Failed to fetch secretaries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`admin_${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many admin requests. Please try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only supreme leaders can access this" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const result = await db.collection("users").updateOne(
      { email },
      { $set: { role: "mess_secretary" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Successfully assigned 'mess_secretary' to ${email}` });
  } catch (error) {
    console.error("Failed to assign role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`admin_${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many admin requests. Please try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only supreme leaders can access this" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const result = await db.collection("users").updateOne(
      { email },
      { $set: { role: "student" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Successfully removed 'mess_secretary' role from ${email}` });
  } catch (error) {
    console.error("Failed to remove role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
