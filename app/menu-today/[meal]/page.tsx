"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, Star, Loader2, MessageSquare, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MealDetailsPage(props: { params: Promise<{ meal: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const mealName = decodeURIComponent(params.meal).toUpperCase();

  const [items, setItems] = useState<string>("Loading menu...");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, menuRes] = await Promise.all([
          fetch("/api/reviews"),
          fetch("/api/menu")
        ]);

        let reviewsData: any[] = [];
        if (reviewsRes.ok) {
          const allReviews = await reviewsRes.json();
          // Filter all-time reviews for this specific meal
          reviewsData = allReviews.filter((r: any) => r.for?.toUpperCase() === mealName);
          // Sort by newest first
          reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(reviewsData);
        }

        if (menuRes.ok) {
          const data = await menuRes.json();
          if (data.tableData && data.tableData.length > 0) {
            const table = data.tableData;
            const headers = table[0];
            const today = dayjs().format("dddd"); 
            
            const colIndex = headers.findIndex((h: string) => h.trim().toLowerCase() === today.toLowerCase());
            
            if (colIndex !== -1) {
              let foundItems = "Not serving today";
              for (let i = 1; i < table.length; i++) {
                const rowMeal = (table[i][0] || `Meal ${i}`).trim().toUpperCase();
                if (rowMeal === mealName) {
                  foundItems = table[i][colIndex] || "Not specified";
                  break;
                }
              }
              setItems(foundItems);
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

  // Analytics Computation (All Time)
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews).toFixed(1)
    : "0.0";

  // Distribution
  const distribution = [
    { stars: "5", count: 0 },
    { stars: "4", count: 0 },
    { stars: "3", count: 0 },
    { stars: "2", count: 0 },
    { stars: "1", count: 0 },
  ];
  
  reviews.forEach(r => {
    const rVal = Math.round(parseFloat(r.rating) || 0);
    if (rVal >= 1 && rVal <= 5) {
      const idx = 5 - rVal;
      distribution[idx].count += 1;
    }
  });

  // Calculate percentage for visual bars
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  // Reviews with feedback text
  const textReviews = reviews.filter(r => r.feedback && r.feedback.trim() !== "");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/menu-today" className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl shadow-sm border border-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{mealName.toLowerCase()}</h1>
          <p className="text-gray-500 text-sm">Today's menu details and all-time analytics</p>
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
                All-Time Analytics
              </h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-black text-gray-900 mb-1">{avgRating}</div>
                  <div className="flex items-center justify-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.round(parseFloat(avgRating)) ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`} 
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
                          className="h-full bg-orange-400 rounded-full" 
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
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {textReviews.length} Written
              </span>
            </div>
            
            <CardContent className="p-0 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)", minHeight: "400px" }}>
              {textReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No written reviews yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later for student feedback.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {textReviews.map((review, i) => (
                    <div key={i} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-gray-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name || "Student"}`} />
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {review.user?.name || "Anonymous Student"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {dayjs(review.createdAt).format("MMM D, YYYY • h:mm A")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                          <span className="font-bold text-gray-900 text-sm">{parseFloat(review.rating).toFixed(1)}</span>
                          <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed ml-13">
                        "{review.feedback}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
