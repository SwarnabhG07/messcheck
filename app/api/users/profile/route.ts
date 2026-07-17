import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function PUT(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`profile_${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many profile updates. Please try again later." }, { status: 429 });
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, college, yearOfStudy, rollNumber, graduationYear, hostel } = data;

    if (!name || !college || !yearOfStudy || !rollNumber || !graduationYear || !hostel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (typeof name !== "string" || name.length > 50) {
      return NextResponse.json({ error: "Name must be a string up to 50 characters" }, { status: 400 });
    }
    if (typeof college !== "string" || college.length > 100) {
      return NextResponse.json({ error: "College must be a string up to 100 characters" }, { status: 400 });
    }
    if (typeof hostel !== "string" || hostel.length > 100) {
      return NextResponse.json({ error: "Hostel must be a string up to 100 characters" }, { status: 400 });
    }
    if (typeof yearOfStudy !== "string" || yearOfStudy.length > 50) {
      return NextResponse.json({ error: "Year of study must be a string up to 50 characters" }, { status: 400 });
    }
    if (typeof rollNumber !== "string" || rollNumber.length > 50) {
      return NextResponse.json({ error: "Roll number must be a string up to 50 characters" }, { status: 400 });
    }
    if (typeof graduationYear !== "string" || graduationYear.length > 50) {
      return NextResponse.json({ error: "Graduation year must be a string up to 50 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          college,
          yearOfStudy,
          rollNumber,
          graduationYear,
          hostel,
          onboarded: true,
        },
      }
    );

    // Update the user's name across all their existing reviews
    await db.collection("reviews").updateMany(
      { email: session.user.email },
      { $set: { name: name } }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`profile_${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many profile updates. Please try again later." }, { status: 429 });
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    // 1. Delete all reviews authored by this user
    await db.collection("reviews").deleteMany({ email: session.user.email });

    // 2. Delete the user's account
    await db.collection("users").deleteOne({ email: session.user.email });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
