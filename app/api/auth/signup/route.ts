import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`signup_${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });
    }

    const { name, email, password, college, hostel, rollNumber, yearOfStudy, graduationYear } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (typeof name !== "string" || name.length > 50) {
      return NextResponse.json({ error: "Name must be a string up to 50 characters" }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 50 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format or length exceeds 50 characters" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 3 || password.length > 100) {
      return NextResponse.json({ error: "Password must be between 3 and 100 characters" }, { status: 400 });
    }
    if (college && (typeof college !== "string" || college.length > 100)) {
      return NextResponse.json({ error: "College must be a string up to 100 characters" }, { status: 400 });
    }
    if (hostel && (typeof hostel !== "string" || hostel.length > 100)) {
      return NextResponse.json({ error: "Hostel must be a string up to 100 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      // Prevent user enumeration by returning a generic success message
      return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the new user
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "student",
      college: college || null,
      hostel: hostel || null,
      rollNumber: rollNumber || null,
      yearOfStudy: yearOfStudy || null,
      graduationYear: graduationYear || null,
      onboarded: Boolean(college && hostel && rollNumber),
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
