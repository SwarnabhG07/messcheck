import clientPromise from "../../lib/mongodb";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

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

export async function POST(req) {
  try {
    const data = await req.json();
    
    
    if (!data.name || !data.rating || !data.text || !data.for) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const newReview = {
      name: data.name,
      rating: data.rating.toString(),
      text: data.text,
      for: data.for,
      time: dayjs().toISOString(), 
      createdAt: new Date(),
    };
    
    const result = await db.collection("reviews").insertOne(newReview);
    
    return NextResponse.json({ ...newReview, _id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error("Failed to post review:", e);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}