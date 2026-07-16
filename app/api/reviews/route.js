import clientPromise from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user || !user.college || !user.hostel) {
      return NextResponse.json([]);
    }
    
    const reviews = await db.collection("reviews").find({
      college: user.college,
      hostel: user.hostel
    }).toArray();
    
    const sanitizedReviews = reviews.map(review => {
      const likes = review.likes || [];
      const dislikes = review.dislikes || [];
      
      const sanitized = {
        ...review,
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        hasLiked: likes.includes(session.user.email),
        hasDisliked: dislikes.includes(session.user.email)
      };
      
      delete sanitized.likes;
      delete sanitized.dislikes;
      
      return sanitized;
    });
    
    return NextResponse.json(sanitizedReviews);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    // Validate required fields
    if (!data.name || !data.rating || !data.text || !data.for || !data.day) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user || !user.college || !user.hostel) {
      return NextResponse.json({ error: "User profile incomplete" }, { status: 403 });
    }
    
    const newReview = {
      name: data.name,
      email: session.user.email,
      college: user.college,
      hostel: user.hostel,
      rating: data.rating.toString(),
      text: data.text,
      for: data.for,
      day: data.day,
      time: dayjs().toISOString(), // Store as ISO string
      createdAt: new Date(),
    };
    
    const result = await db.collection("reviews").insertOne(newReview);
    
    const responseReview = { 
      ...newReview, 
      _id: result.insertedId,
      likesCount: 0,
      dislikesCount: 0,
      hasLiked: false,
      hasDisliked: false
    };
    
    return NextResponse.json(responseReview, { status: 201 });
  } catch (e) {
    console.error("Failed to post review:", e);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (!data._id || !data.rating || !data.text || !data.for || !data.day) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    // Ensure the review belongs to the user editing it
    const existingReview = await db.collection("reviews").findOne({ _id: new ObjectId(data._id) });
    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    if (existingReview.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedFields = {
      rating: data.rating.toString(),
      text: data.text,
      for: data.for,
      day: data.day,
    };

    await db.collection("reviews").updateOne(
      { _id: new ObjectId(data._id) },
      { $set: updatedFields }
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Failed to update review:", e);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}