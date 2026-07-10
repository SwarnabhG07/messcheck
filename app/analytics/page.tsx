"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar as CalendarIcon, TrendingUp, Users, Award, Clock } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

type Timeframe = "day" | "week" | "month";

export default function AnalyticsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [timeframe, setTimeframe] = useState<Timeframe>("week");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  const periodReviews = reviews.filter(r => {
    if (!r.createdAt) return false;
    const reviewDate = dayjs(r.createdAt);
    return reviewDate.isBetween(startOfPeriod, endOfPeriod, null, '[]');
  });

  // 1. Key Metrics
  const totalReviews = periodReviews.length;
  const avgRating = totalReviews > 0 
    ? (periodReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews).toFixed(1)
    : "0.0";

  // Meal stats
  const mealStats: Record<string, { total: number; count: number }> = {
    "BREAKFAST": { total: 0, count: 0 },
    "LUNCH": { total: 0, count: 0 },
    "SNACKS": { total: 0, count: 0 },
    "DINNER": { total: 0, count: 0 }
  };
  
  // Day stats (Only relevant for week/month)
  const dayStats: Record<string, number> = {
    "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
  };

  periodReviews.forEach(r => {
    const meal = r.for?.toUpperCase();
    if (mealStats[meal]) {
      mealStats[meal].total += parseFloat(r.rating) || 0;
      mealStats[meal].count += 1;
    }
    const day = dayjs(r.createdAt).format("dddd");
    if (dayStats[day] !== undefined) {
      dayStats[day] += 1;
    }
  });

  let highestMeal = "N/A";
  let maxMealAvg = 0;
  Object.entries(mealStats).forEach(([meal, stats]) => {
    if (stats.count > 0) {
      const avg = stats.total / stats.count;
      if (avg > maxMealAvg) {
        maxMealAvg = avg;
        highestMeal = meal;
      }
    }
  });

  let mostActiveDay = "N/A";
  let maxDayCount = 0;
  Object.entries(dayStats).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostActiveDay = day;
    }
  });

  // 2. Trend Data
  let trendData: { name: string; value: number }[] = [];
  
  if (timeframe === "day") {
    // For a single day, show meals on X-axis
    trendData = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"].map(meal => {
      const mealReviews = periodReviews.filter(r => r.for?.toUpperCase() === meal);
      const avg = mealReviews.length > 0 
        ? mealReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / mealReviews.length
        : 0;
      return { name: meal.substring(0, 3), value: parseFloat(avg.toFixed(1)) };
    });
  } else if (timeframe === "week") {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    trendData = daysOfWeek.map(day => {
      const dayReviews = periodReviews.filter(r => dayjs(r.createdAt).format("dddd") === day);
      const avg = dayReviews.length > 0 
        ? dayReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / dayReviews.length
        : 0;
      return { name: day.substring(0, 3), value: parseFloat(avg.toFixed(1)) };
    });
  } else if (timeframe === "month") {
    const daysInMonth = endOfPeriod.date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayReviews = periodReviews.filter(r => dayjs(r.createdAt).date() === i);
      const avg = dayReviews.length > 0 
        ? dayReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / dayReviews.length
        : 0;
      trendData.push({ name: i.toString(), value: parseFloat(avg.toFixed(1)) });
    }
  }

  // 3. Meal Breakdown Data
  const breakdownData = [
    { name: "Breakfast", rating: parseFloat(mealStats["BREAKFAST"].count ? (mealStats["BREAKFAST"].total / mealStats["BREAKFAST"].count).toFixed(1) : "0") },
    { name: "Lunch", rating: parseFloat(mealStats["LUNCH"].count ? (mealStats["LUNCH"].total / mealStats["LUNCH"].count).toFixed(1) : "0") },
    { name: "Snacks", rating: parseFloat(mealStats["SNACKS"].count ? (mealStats["SNACKS"].total / mealStats["SNACKS"].count).toFixed(1) : "0") },
    { name: "Dinner", rating: parseFloat(mealStats["DINNER"].count ? (mealStats["DINNER"].total / mealStats["DINNER"].count).toFixed(1) : "0") }
  ];

  let headerLabel = "";
  if (timeframe === "day") {
    headerLabel = startOfPeriod.format("MMM D, YYYY");
  } else if (timeframe === "week") {
    headerLabel = `${startOfPeriod.format("MMM D")} - ${endOfPeriod.format("MMM D, YYYY")}`;
  } else {
    headerLabel = startOfPeriod.format("MMMM YYYY");
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing data for {headerLabel}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-1 flex gap-1">
            {(["day", "week", "month"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  timeframe === tf 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-start">
                <div className="p-2 bg-blue-50 rounded-lg mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Total Reviews</div>
                <div className="text-2xl font-bold text-gray-900">{totalReviews}</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-start">
                <div className="p-2 bg-orange-50 rounded-lg mb-3">
                  <Star className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Avg Rating</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  {avgRating} <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-start">
                <div className="p-2 bg-green-50 rounded-lg mb-3">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Top Meal</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {highestMeal.toLowerCase()}
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow ${timeframe === 'day' ? 'opacity-50 grayscale' : ''}`}>
              <CardContent className="p-5 flex flex-col items-start">
                <div className="p-2 bg-purple-50 rounded-lg mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Active Day</div>
                <div className="text-2xl font-bold text-gray-900 truncate w-full">
                  {timeframe === 'day' ? '-' : mostActiveDay}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <Card className="rounded-2xl border-gray-100 shadow-sm flex flex-col">
              <div className="p-6 pb-2">
                <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Satisfaction Trend
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {timeframe === 'day' ? 'Average rating by meal type' : timeframe === 'week' ? 'Average rating by day of week' : 'Average rating by day of month'}
                </p>
              </div>
              <CardContent className="p-5 flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: timeframe === 'month' ? 10 : 12 }} 
                      dy={10} 
                      interval={timeframe === 'month' ? 2 : 0}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      ticks={[0, 1, 2, 3, 4, 5]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Meal Breakdown Chart */}
            <Card className="rounded-2xl border-gray-100 shadow-sm flex flex-col">
              <div className="p-6 pb-2">
                <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  Meal Breakdown
                </h2>
                <p className="text-gray-500 text-sm mt-1">Performance by meal type</p>
              </div>
              <CardContent className="p-5 flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={breakdownData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#94a3b8" }} />
                    <Radar 
                      name="Rating" 
                      dataKey="rating" 
                      stroke="#f97316" 
                      fill="#fb923c" 
                      fillOpacity={0.5} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
