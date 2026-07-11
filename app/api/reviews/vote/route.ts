import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;

    const data = await req.json();
    const { reviewId, action } = data; // action should be 'like' or 'dislike'

    if (!reviewId || !['like', 'dislike'].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const review = await db.collection("reviews").findOne({ _id: new ObjectId(reviewId) });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    let likes = review.likes || [];
    let dislikes = review.dislikes || [];

    if (action === 'like') {
      // Remove from dislikes
      dislikes = dislikes.filter((email: string) => email !== userEmail);
      
      // Toggle like
      if (likes.includes(userEmail)) {
        likes = likes.filter((email: string) => email !== userEmail);
      } else {
        likes.push(userEmail);
      }
    } else if (action === 'dislike') {
      // Remove from likes
      likes = likes.filter((email: string) => email !== userEmail);
      
      // Toggle dislike
      if (dislikes.includes(userEmail)) {
        dislikes = dislikes.filter((email: string) => email !== userEmail);
      } else {
        dislikes.push(userEmail);
      }
    }

    await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { likes, dislikes } }
    );

    return NextResponse.json({ success: true, likes, dislikes }, { status: 200 });
  } catch (error) {
    console.error("Voting error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
