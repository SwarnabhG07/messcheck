import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, college, hostel, rollNumber, yearOfStudy, graduationYear } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("messcheck");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
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
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
