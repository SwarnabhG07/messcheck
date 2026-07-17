import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`vote_${ip}`, 20, 5 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many votes. Please try again later." }, { status: 429 });
    }

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
    
    const collection = db.collection("reviews");
    
    // First, verify the review actually exists
    const reviewExists = await collection.findOne({ _id: new ObjectId(reviewId) }, { projection: { _id: 1 } });
    if (!reviewExists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === 'like') {
      // Try to toggle off (unlike)
      const result = await collection.updateOne(
        { _id: new ObjectId(reviewId), likes: userEmail },
        { $pull: { likes: userEmail } } as any
      );
      
      // If we didn't unlike, it means we need to like
      if (result.modifiedCount === 0) {
        await collection.updateOne(
          { _id: new ObjectId(reviewId) },
          { 
            $addToSet: { likes: userEmail },
            $pull: { dislikes: userEmail }
          } as any
        );
      }
    } else if (action === 'dislike') {
      // Try to toggle off (undislike)
      const result = await collection.updateOne(
        { _id: new ObjectId(reviewId), dislikes: userEmail },
        { $pull: { dislikes: userEmail } } as any
      );
      
      // If we didn't undislike, it means we need to dislike
      if (result.modifiedCount === 0) {
        await collection.updateOne(
          { _id: new ObjectId(reviewId) },
          { 
            $addToSet: { dislikes: userEmail },
            $pull: { likes: userEmail }
          } as any
        );
      }
    }

    // Fetch the updated document to return accurate safe counts
    const updatedReview = await collection.findOne({ _id: new ObjectId(reviewId) });
    const likes = updatedReview?.likes || [];
    const dislikes = updatedReview?.dislikes || [];

    return NextResponse.json({ 
      success: true, 
      likesCount: likes.length, 
      dislikesCount: dislikes.length,
      hasLiked: likes.includes(userEmail),
      hasDisliked: dislikes.includes(userEmail)
    }, { status: 200 });
  } catch (error) {
    console.error("Voting error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
