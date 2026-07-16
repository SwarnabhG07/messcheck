"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Plus, Pencil, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  day: z.string().min(1, "Day is required"),
  rating: z.string().min(1, "Rating is required"),
  for: z.string().min(1, "Meal type is required"),
  text: z.string().min(5, "Review must be at least 5 characters long").max(500, "Review is too long"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface Review {
  _id?: string;
  name: string;
  email?: string;
  rating: string;
  text: string;
  for: string;
  day?: string;
  time: string;
  likesCount?: number;
  dislikesCount?: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const displayedReviews = showMyReviews 
    ? reviews.filter(review => review.email && session?.user?.email && review.email === session.user.email) 
    : reviews;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      day: "MONDAY",
      rating: "5",
      for: "BREAKFAST",
      text: "",
    },
  });

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review._id || null);
    reset({
      day: review.day || "MONDAY",
      rating: review.rating,
      for: review.for,
      text: review.text,
    });
    setShowReviewForm(true);
  };
  
  const handleOpenNewReview = () => {
    setEditingReviewId(null);
    reset({
      day: "MONDAY",
      rating: "5",
      for: "BREAKFAST",
      text: "",
    });
  };

  const handleVote = async (reviewId: string | undefined, action: 'like' | 'dislike') => {
    if (!reviewId || !session?.user?.email) return;
    const userEmail = session.user.email;

    // Optimistic UI update
    setReviews(prevReviews => 
      prevReviews.map(review => {
        if (review._id !== reviewId) return review;
        let newLikesCount = review.likesCount || 0;
        let newDislikesCount = review.dislikesCount || 0;
        let newHasLiked = review.hasLiked || false;
        let newHasDisliked = review.hasDisliked || false;

        if (action === 'like') {
          if (newHasDisliked) {
            newHasDisliked = false;
            newDislikesCount = Math.max(0, newDislikesCount - 1);
          }
          if (newHasLiked) {
            newHasLiked = false;
            newLikesCount = Math.max(0, newLikesCount - 1);
          } else {
            newHasLiked = true;
            newLikesCount += 1;
          }
        } else {
          if (newHasLiked) {
            newHasLiked = false;
            newLikesCount = Math.max(0, newLikesCount - 1);
          }
          if (newHasDisliked) {
            newHasDisliked = false;
            newDislikesCount = Math.max(0, newDislikesCount - 1);
          } else {
            newHasDisliked = true;
            newDislikesCount += 1;
          }
        }

        return { 
          ...review, 
          likesCount: newLikesCount, 
          dislikesCount: newDislikesCount,
          hasLiked: newHasLiked,
          hasDisliked: newHasDisliked
        };
      })
    );

    // API Call
    try {
      await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action })
      });
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        name: session?.user?.name || "Anonymous User",
        email: session?.user?.email || "",
      };
      
      if (editingReviewId) {
        // PUT request for edit
        const res = await fetch("/api/reviews", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, _id: editingReviewId }),
        });
        
        if (!res.ok) throw new Error("Failed to update review");
        
        setReviews(reviews.map(r => 
          r._id === editingReviewId 
            ? { ...r, ...data } 
            : r
        ));
      } else {
        // POST request for new review
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error("Failed to post review");
        
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
      }
      
      setShowReviewForm(false);
      setEditingReviewId(null);
      reset({
        day: "MONDAY",
        rating: "5",
        for: "BREAKFAST",
        text: "",
      });
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
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="my-reviews" 
                checked={showMyReviews} 
                onCheckedChange={setShowMyReviews} 
                disabled={!session?.user}
              />
              <Label htmlFor="my-reviews" className="text-xs font-bold text-gray-600 cursor-pointer">
                My Reviews
              </Label>
            </div>
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenNewReview}
                className="flex items-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25 rounded-xl bg-white border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">{editingReviewId ? "Edit Review" : "Write a Review"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="day" className="text-xs font-bold text-gray-600 uppercase tracking-widest">Day</Label>
                    <select
                      id="day"
                      {...register("day")}
                      className="w-full mt-1.5 h-10 px-3 rounded-lg bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm outline-none"
                    >
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                    {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day.message}</p>}
                  </div>

                  <div className="flex-1">
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
                    className="mt-1.5 rounded-lg bg-[#f0f4f8] border-none focus-visible:ring-black/10 min-h-25 text-sm resize-none"
                  />
                  {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                  >
                    {isSubmitting ? (editingReviewId ? "Saving..." : "Submitting...") : (editingReviewId ? "Save Changes" : "Submit Review")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>
        <Card className="p-0 rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border-gray-100 flex flex-col overflow-hidden">
          {displayedReviews.length === 0 ? (
            <div className="p-6 text-gray-500 text-[14px]">
              {showMyReviews ? "You haven't written any reviews yet." : "No reviews found yet. Add some reviews to your database!"}
            </div>
          ) : (
            displayedReviews.map((review, idx) => (
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
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mb-0.5" />
                  </div>
                </div>
                <p className="text-gray-500 text-[14px] leading-relaxed mb-3">
                  {review.text}
                </p>
                <div className="text-gray-400 text-[13px] flex items-center justify-between mt-1">
                  <div>For: {review.day ? `${review.day} - ` : ""}{review.for} &bull; {review.time ? dayjs(review.time).fromNow() : "Just now"}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-gray-100 rounded-full px-2 py-0.5 bg-gray-50/50">
                      <button 
                        onClick={() => handleVote(review._id, 'like')}
                        className={`flex items-center gap-1.5 px-1 py-1 transition-colors ${review.hasLiked ? "text-green-500 font-bold" : "hover:text-green-500"}`}
                        title="Like"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs">{review.likesCount || 0}</span>
                      </button>
                      <div className="w-px h-3 bg-gray-200 mx-0.5"></div>
                      <button 
                        onClick={() => handleVote(review._id, 'dislike')}
                        className={`flex items-center gap-1.5 px-1 py-1 transition-colors ${review.hasDisliked ? "text-red-500 font-bold" : "hover:text-red-500"}`}
                        title="Dislike"
                      >
                        <span className="text-xs">{review.dislikesCount || 0}</span>
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {review.email && session?.user?.email && review.email === session.user.email && (
                      <button 
                        onClick={() => handleEditClick(review)}
                        className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 ml-1 bg-white border border-gray-100 p-1.5 rounded-full shadow-sm"
                        title="Edit Review"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}
