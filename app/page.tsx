"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Compute Today's Menu
  const mealTypes = [
    { type: "BREAKFAST", name: "Masala Dosa, Sambar, Coconut Chutney, Bread Omelette, Tea,...", image: "/breakfast.png" },
    { type: "LUNCH", name: "Rice, Dal Tadka, Paneer Makhani, Roti, Salad, Fruit Salad, Buttermilk.", image: "/lunch.png" },
    { type: "SNACKS", name: "Punjabi Samosa, Mint Chutney, Jalebi, Filter Coffee, Masala Chai.", image: "/snacks.png" },
    { type: "DINNER", name: "Vegetable Biryani, Raita, Gulab Jamun, Papad, Naan, Fried Rice.", image: "/dinner.png" }
  ];

  const computedTodayMenu = mealTypes.map(meal => {
    const mealReviews = reviews.filter(r => r.for === meal.type);
    const totalRating = mealReviews.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0);
    const avg = mealReviews.length > 0 ? (totalRating / mealReviews.length).toFixed(1) : "0.0";
    return {
      ...meal,
      rating: avg,
      votes: mealReviews.length
    };
  });

  // Compute Overview
  const totalReviews = reviews.length;
  const globalTotalRating = reviews.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0);
  const globalAvg = totalReviews > 0 ? (globalTotalRating / totalReviews).toFixed(1) : "0.0";

  const computedOverviewData = [
    { title: "Overall Rating", value: globalAvg, suffix: <Star className="w-[18px] h-[18px] text-orange-400 fill-orange-400 inline mb-1" />, subtitle: `${totalReviews} Ratings` },
    { title: "Menu Updates", value: "6", subtitle: "This Week" }, // Hardcoded for now
    { title: "Feedback Volume", value: totalReviews.toString(), subtitle: "total reviews" },
  ];

  // Compute Chart Data (Day of week)
  const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const displayNames: Record<string, string> = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun" };
  
  const computedChartData = daysOrder.map(day => {
    const dayReviews = reviews.filter(r => r.day === day);
    const dayTotal = dayReviews.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0);
    const dayAvg = dayReviews.length > 0 ? (dayTotal / dayReviews.length).toFixed(2) : "0";
    return {
      name: displayNames[day],
      value: parseFloat(dayAvg)
    };
  });

  if (loading) {
    return (
      <div className="px-8 py-6 text-gray-500 font-medium flex items-center justify-center h-64">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="px-8 pb-6 space-y-5">
      {/* Today's Menu Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          TODAY'S MENU
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {computedTodayMenu.map((item) => (
            <Card
              key={item.type}
              className="p-0 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-gray-50/50"
            >
              <CardContent className="p-2.5 flex gap-3.5 items-center">
              <div className="w-[76px] h-[76px] rounded-lg overflow-hidden shrink-0 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-gray-900 text-[15px]">
                    {item.type}
                  </h3>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-[15px] flex items-center gap-1 justify-end leading-none">
                      {item.rating}
                      <Star className="w-[13px] h-[13px] text-orange-400 fill-orange-400" />
                    </div>
                    <div className="text-gray-400 text-[10px] mt-0.5 leading-none">
                      {item.votes} votes
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-[11.5px] leading-snug line-clamp-2 max-w-[85%] pr-2 mb-1">
                  {item.name}
                </p>
                <a
                  href="#"
                  className="text-blue-600 font-bold text-[11px] tracking-wider uppercase hover:text-blue-700 transition-colors"
                >
                  VIEW DETAILS
                </a>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Weekly Overview Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          WEEKLY OVERVIEW
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {computedOverviewData.map((stat, i) => (
            <Card
              key={i}
              className="p-0 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-gray-50/50"
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-gray-500 text-[13px] font-medium mb-1">
                {stat.title}
              </div>
              <div className="font-bold text-2xl text-gray-900 mb-0.5 flex items-center gap-1 justify-center">
                {stat.value}
                {stat.suffix && <span>{stat.suffix}</span>}
              </div>
              <div className="text-gray-400 text-[11px] h-3.5">
                {stat.subtitle}
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Weekly Satisfaction Trend Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          WEEKLY SATISFACTION TREND
        </h2>
        <Card className="p-0 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-gray-50/50">
          <CardContent className="p-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={computedChartData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
