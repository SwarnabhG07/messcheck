"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { ArrowLeft, Star, Loader2, MessageSquare, User, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

type Timeframe = "day" | "week" | "month" | "all-time";

export default function MealDetailsPage(props: { params: Promise<{ meal: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const mealName = decodeURIComponent(params.meal).toUpperCase();

  const { data: session } = useSession();
  const [items, setItems] = useState<string>("Loading menu...");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [timeframe, setTimeframe] = useState<Timeframe>("all-time");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || "Student",
          rating: parseFloat(reviewRating),
          text: reviewText,
          for: mealName,
          day: dayjs().format("dddd")
        })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setIsReviewOpen(false);
        setReviewText("");
        setReviewRating("5");
      } else {
        alert("Failed to submit review");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, menuRes] = await Promise.all([
          fetch("/api/reviews"),
          fetch("/api/menu")
        ]);

        if (reviewsRes.ok) {
          const allReviews = await reviewsRes.json();
          const mealReviews = allReviews.filter((r: any) => r.for?.toUpperCase() === mealName);
          mealReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(mealReviews);
        }

        if (menuRes.ok) {
          const data = await menuRes.json();
          if (data.tableData && data.tableData.length > 0) {
            const table = data.tableData;
            const targetDay = dayjs().format("dddd").toUpperCase();
            const targetMeal = mealName.toUpperCase();

            let dayRowIdx = -1, dayColIdx = -1;
            let mealRowIdx = -1, mealColIdx = -1;

            for (let r = 0; r < table.length; r++) {
              for (let c = 0; c < table[r].length; c++) {
                const cell = (table[r][c] || "").toUpperCase().trim();
                if (cell.includes(targetDay)) {
                  dayRowIdx = r;
                  dayColIdx = c;
                }
                if (cell.includes(targetMeal)) {
                  mealRowIdx = r;
                  mealColIdx = c;
                }
              }
            }

            if (dayRowIdx !== -1 && mealRowIdx !== -1) {
              if (dayColIdx < mealColIdx) {
                const intersection = table[dayRowIdx]?.[mealColIdx];
                setItems(intersection && intersection.trim() !== "" ? intersection.trim() : "Could not find menu for today.");
              } else if (mealColIdx < dayColIdx) {
                const intersection = table[mealRowIdx]?.[dayColIdx];
                setItems(intersection && intersection.trim() !== "" ? intersection.trim() : "Could not find menu for today.");
              } else {
                 setItems("Could not find menu for today.");
              }
            } else {
              setItems("Could not find menu for today.");
            }
          } else {
             setItems("Menu data not available.");
          }
        } else {
           setItems("Failed to load menu.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mealName]);

  const getMealImage = (meal: string) => {
    switch (meal.toLowerCase()) {
      case "breakfast": return "/breakfast.png";
      case "lunch": return "/lunch.png";
      case "snacks": return "/snacks.png";
      case "dinner": return "/dinner.png";
      default: return "/lunch.png";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading {mealName.toLowerCase()} details...</p>
      </div>
    );
  }

  // Timeframe logic
  const currentDate = dayjs(selectedDate);
  let startOfPeriod = currentDate;
  let endOfPeriod = currentDate;
  
  if (timeframe === "day") {
    startOfPeriod = currentDate.startOf('day');
    endOfPeriod = currentDate.endOf('day');
  } else if (timeframe === "week") {
    const dayOfWeek = currentDate.day(); 
    startOfPeriod = dayOfWeek === 0 ? currentDate.subtract(6, 'day').startOf('day') : currentDate.startOf('week').add(1, 'day').startOf('day');
    endOfPeriod = startOfPeriod.add(6, 'day').endOf('day');
  } else if (timeframe === "month") {
    startOfPeriod = currentDate.startOf('month');
    endOfPeriod = currentDate.endOf('month');
  }

  const filteredReviews = timeframe === "all-time" 
    ? reviews 
    : reviews.filter(r => {
        if (!r.createdAt) return false;
        const reviewDate = dayjs(r.createdAt);
        return reviewDate.isBetween(startOfPeriod, endOfPeriod, null, '[]');
      });

  // Analytics Computation
  const totalReviews = filteredReviews.length;
  const avgRating = totalReviews > 0 
    ? (filteredReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews).toFixed(1)
    : "0.0";

  // Distribution
  const distribution = [
    { stars: "5", count: 0 },
    { stars: "4", count: 0 },
    { stars: "3", count: 0 },
    { stars: "2", count: 0 },
    { stars: "1", count: 0 },
  ];
  
  filteredReviews.forEach(r => {
    const rVal = Math.round(parseFloat(r.rating) || 0);
    if (rVal >= 1 && rVal <= 5) {
      const idx = 5 - rVal;
      distribution[idx].count += 1;
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/menu-today" className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl shadow-sm border border-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{mealName.toLowerCase()}</h1>
            <p className="text-gray-500 text-sm">Today's menu details and analytics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker (hidden unless 'day' is selected) */}
          {timeframe === "day" && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
              />
            </div>
          )}

          {/* Timeframe Selector */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 flex gap-1">
            {(["day", "week", "month", "all-time"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  timeframe === tf 
                    ? "bg-amber-50 text-amber-700 shadow-sm font-bold" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tf.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dish Info & Analytics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dish Card */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
            <div className="relative w-full h-48 bg-gray-100">
              <Image 
                src={getMealImage(mealName)} 
                alt={mealName} 
                fill 
                className="object-cover" 
              />
            </div>
            <CardContent className="p-5">
              <h2 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">
                Today's Dishes
              </h2>
              <p className="text-gray-900 font-medium leading-relaxed">
                {items}
              </p>
            </CardContent>
          </Card>

          {/* Analytics Overview */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-6">
                {timeframe === "all-time" ? "All-Time Analytics" : "Period Analytics"}
              </h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-black text-gray-900 mb-1">{avgRating}</div>
                  <div className="flex items-center justify-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.round(parseFloat(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-gray-400 text-xs font-medium mt-2">{totalReviews} Ratings</div>
                </div>
                
                <div className="flex-1 space-y-2.5">
                  {distribution.map((d) => (
                    <div key={d.stars} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium w-3 text-right">{d.stars}</span>
                      <Star className="w-3.5 h-3.5 text-gray-400" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${(d.count / totalReviews) * 100 || 0}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-6">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reviews Feed */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-gray-100 shadow-sm h-full flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Recent Reviews
              </h2>
              <div className="flex items-center gap-3">
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {filteredReviews.length} Reviews
                </span>
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm font-semibold rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl bg-white shadow-xl border-gray-100 p-6">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewRating(star.toString())}
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full p-1 transition-transform hover:scale-110 cursor-pointer"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= parseInt(reviewRating)
                                    ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                                    : "text-gray-200 fill-gray-200 hover:text-gray-300 hover:fill-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 min-w-0 w-full">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-gray-700 block">Comments (Optional)</label>
                          <span className={`text-xs ${reviewText.length > 450 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {reviewText.length}/500
                          </span>
                        </div>
                        <Textarea 
                          placeholder="How was the food?" 
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="resize-none h-28 max-h-[150px] overflow-y-auto rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 p-3 text-sm w-full max-w-full break-words break-all"
                          style={{ fieldSizing: 'fixed' } as any}
                          maxLength={500}
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
                      <Button variant="outline" onClick={() => setIsReviewOpen(false)} className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium cursor-pointer">Cancel</Button>
                      <Button onClick={handleSubmitReview} disabled={isSubmitting} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-colors cursor-pointer">
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Submit Review
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <CardContent className="p-0 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)", minHeight: "400px" }}>
              {filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No reviews for this period.</p>
                  <p className="text-gray-400 text-sm mt-1">Try selecting a different timeframe.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredReviews.map((review, i) => {
                    const hasFeedback = review.text && review.text.trim() !== "";
                    return (
                      <div key={i} className="p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-gray-100">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.name || "Student"}`} />
                              <AvatarFallback className="bg-amber-50 text-amber-600 font-bold">
                                <User className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {review.name || "Anonymous Student"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {dayjs(review.createdAt).format("MMM D, YYYY • h:mm A")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                            <span className="font-bold text-gray-900 text-sm">{parseFloat(review.rating).toFixed(1)}</span>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          </div>
                        </div>
                        
                        <p className={`text-sm leading-relaxed ml-13 ${hasFeedback ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                          {hasFeedback ? `"${review.text}"` : "(No written feedback provided)"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
