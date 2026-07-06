"use client";

import { useState, useEffect } from "react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Review {
  _id?: string;
  name: string;
  rating: string;
  text: string;
  for: string;
  time: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="px-8 py-6 text-gray-500 font-medium">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="px-8 pb-6 space-y-5 relative">
      <section>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase">
            STUDENT REVIEWS
          </h2>
          <Button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </Button>
        </div>
        <Card className="p-0 rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border-gray-100 flex flex-col overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-6 text-gray-500 text-[14px]">
              No reviews found yet. Add some reviews to your database!
            </div>
          ) : (
            reviews.map((review, idx) => (
              <div
                key={review._id || idx}
                className={`p-6 ${
                  idx !== reviews.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-bold text-gray-900 text-[15px]">
                    {review.name}
                  </h3>
                  <div className="flex items-center gap-1 font-bold text-gray-900 text-[15px]">
                    {review.rating}
                    <Star className="w-[14px] h-[14px] text-orange-400 fill-orange-400 mb-0.5" />
                  </div>
                </div>
                <p className="text-gray-500 text-[14px] leading-relaxed mb-3">
                  {review.text}
                </p>
                <div className="text-gray-400 text-[13px]">
                  For: {review.for} &bull; {review.time}
                </div>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}
