import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { college, yearOfStudy, rollNumber, graduationYear, hostel } = data;

    if (!college || !yearOfStudy || !rollNumber || !graduationYear || !hostel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          college,
          yearOfStudy,
          rollNumber,
          graduationYear,
          hostel,
          onboarded: true,
        },
      }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    // 1. Delete all reviews authored by this user
    await db.collection("reviews").deleteMany({ userEmail: session.user.email });

    // 2. Delete the user's account
    await db.collection("users").deleteOne({ email: session.user.email });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
