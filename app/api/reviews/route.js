import clientPromise from "../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const reviews = await db.collection("reviews").find({}).toArray();
    
    return NextResponse.json(reviews);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}