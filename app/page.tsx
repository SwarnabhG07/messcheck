"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [menuData, setMenuData] = useState<string[][]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, menuRes, notificationsRes] = await Promise.all([
          fetch("/api/reviews"),
          fetch("/api/menu"),
          fetch("/api/announcements")
        ]);
        
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data);
        }

        if (menuRes.ok) {
          const mData = await menuRes.json();
          if (mData.tableData && Array.isArray(mData.tableData)) {
            setMenuData(mData.tableData);
          }
        }

        if (notificationsRes && notificationsRes.ok) {
          const nData = await notificationsRes.json();
          if (nData.announcements) {
            setNotifications(nData.announcements);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper to extract a meal for today from the parsed CSV menu
  const getMealItems = (tableData: string[][], day: string, mealType: string, defaultItems: string) => {
    if (!tableData || tableData.length === 0) return defaultItems;
    
    const targetDay = day.toUpperCase();
    const targetMeal = mealType.toUpperCase();

    let dayRowIdx = -1, dayColIdx = -1;
    let mealRowIdx = -1, mealColIdx = -1;

    for (let r = 0; r < tableData.length; r++) {
      for (let c = 0; c < tableData[r].length; c++) {
        const cell = (tableData[r][c] || "").toUpperCase().trim();
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

    if (dayRowIdx === -1 || mealRowIdx === -1) return defaultItems;

    // The data cell is at the intersection of the RowHeader and ColumnHeader.
    // The RowHeader will always be further to the left (smaller column index).
    if (dayColIdx < mealColIdx) {
      // Day is on the left, Meal is on top
      const intersection = tableData[dayRowIdx]?.[mealColIdx];
      return intersection && intersection.trim() !== "" ? intersection.trim() : defaultItems;
    } else if (mealColIdx < dayColIdx) {
      // Meal is on the left, Day is on top
      const intersection = tableData[mealRowIdx]?.[dayColIdx];
      return intersection && intersection.trim() !== "" ? intersection.trim() : defaultItems;
    }

    return defaultItems;
  };

  // Compute Today's Menu
  const currentDayStr = new Date().toLocaleDateString("en-US", { weekday: "long" });
  
  const mealTypes = [
    { type: "BREAKFAST", name: getMealItems(menuData, currentDayStr, "BREAKFAST", "Masala Dosa, Sambar, Coconut Chutney, Bread Omelette, Tea,..."), image: "/breakfast.png" },
    { type: "LUNCH", name: getMealItems(menuData, currentDayStr, "LUNCH", "Rice, Dal Tadka, Paneer Makhani, Roti, Salad, Fruit Salad, Buttermilk."), image: "/lunch.png" },
    { type: "SNACKS", name: getMealItems(menuData, currentDayStr, "SNACKS", "Punjabi Samosa, Mint Chutney, Jalebi, Filter Coffee, Masala Chai."), image: "/snacks.png" },
    { type: "DINNER", name: getMealItems(menuData, currentDayStr, "DINNER", "Vegetable Biryani, Raita, Gulab Jamun, Papad, Naan, Fried Rice."), image: "/dinner.png" }
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
    { title: "Overall Rating", value: globalAvg, suffix: <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400 inline mb-1" />, subtitle: `${totalReviews} Ratings` },
    { title: "Notifications", value: (notifications?.length || 0).toString(), subtitle: "Total Announcements" },
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
              <CardContent className="p-2.5 flex gap-3.5 items-stretch">
              <div className="w-19 h-19 rounded-lg overflow-hidden shrink-0 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-gray-900 text-[17px]">
                    {item.type}
                  </h3>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-[15px] flex items-center gap-1 justify-end leading-none">
                      {item.rating}
                      <Star className="w-3.25 h-3.25 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="text-gray-400 text-[10px] mt-0.5 leading-none">
                      {item.votes} votes
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-gray-500 text-[13px] leading-snug line-clamp-2 max-w-[90%] pr-2">
                    {item.name}
                  </p>
                  <Link
                    href={`/menu-today/${item.type.toLowerCase()}`}
                    className="text-amber-500 font-bold text-[13px] tracking-wider uppercase hover:text-amber-600 transition-colors inline-block mt-0.5"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
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
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {computedOverviewData.map((stat, i) => (
            <Card
              key={i}
              className="p-0 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-gray-50/50"
            >
              <CardContent className="p-2.5 md:p-4 flex flex-col items-center justify-center text-center h-full">
              <div className="text-gray-500 text-[11px] md:text-[13px] font-medium mb-1 leading-tight min-h-8 md:min-h-0 flex items-center justify-center">
                {stat.title}
              </div>
              <div className="font-bold text-xl md:text-2xl text-gray-900 mb-0.5 flex items-center gap-0.5 md:gap-1 justify-center">
                {stat.value}
                {stat.suffix && <span>{stat.suffix}</span>}
              </div>
              <div className="text-gray-400 text-[10px] md:text-[11px] leading-tight mt-1">
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
          <CardContent className="px-1 py-5 md:p-5 h-60">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={computedChartData}
              margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
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
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                interval={0}
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
                fill="#f59e0b"
                radius={[2, 2, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
