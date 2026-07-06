"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const reviewSchema = z.object({
  rating: z.string().min(1, "Rating is required"),
  for: z.string().min(1, "Meal type is required"),
  text: z.string().min(5, "Review must be at least 5 characters long").max(500, "Review is too long"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface Review {
  _id?: string;
  name: string;
  rating: string;
  text: string;
  for: string;
  time: string;
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "5",
      for: "BREAKFAST",
      text: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        name: session?.user?.name || "Anonymous User",
      };
      
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to post review");
      
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      reset();
    } catch (error) {
      console.error(error);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl bg-white border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Write a Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="for" className="text-xs font-bold text-gray-600 uppercase tracking-widest">Meal</Label>
                  <select
                    id="for"
                    {...register("for")}
                    className="w-full mt-1.5 h-10 px-3 rounded-lg bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm outline-none"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="SNACKS">Snacks</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                  {errors.for && <p className="text-red-500 text-xs mt-1">{errors.for.message}</p>}
                </div>

                <div>
                  <Label htmlFor="rating" className="text-xs font-bold text-gray-600 uppercase tracking-widest">Rating (1-5)</Label>
                  <select
                    id="rating"
                    {...register("rating")}
                    className="w-full mt-1.5 h-10 px-3 rounded-lg bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm outline-none"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                  {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
                </div>

                <div>
                  <Label htmlFor="text" className="text-xs font-bold text-gray-600 uppercase tracking-widest">Your Review</Label>
                  <Textarea
                    id="text"
                    {...register("text")}
                    placeholder="How was the food?"
                    className="mt-1.5 rounded-lg bg-[#f0f4f8] border-none focus-visible:ring-black/10 min-h-[100px] text-sm resize-none"
                  />
                  {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[48px] rounded-xl bg-black text-white font-bold"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                  For: {review.for} &bull; {review.time ? dayjs(review.time).fromNow() : "Just now"}
                </div>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}
