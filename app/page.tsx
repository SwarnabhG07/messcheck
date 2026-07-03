"use client";

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

const todayMenu = [
  {
    type: "BREAKFAST",
    name: "Masala Dosa, Sambar, Coconut Chutney, Bread Omelette, Tea,...",
    image: "/breakfast.png",
    rating: 4.1,
    votes: 210,
  },
  {
    type: "LUNCH",
    name: "Rice, Dal Tadka, Paneer Makhani, Roti, Salad, Fruit Salad, Buttermilk.",
    image: "/lunch.png",
    rating: 4.2,
    votes: 145,
  },
  {
    type: "SNACKS",
    name: "Punjabi Samosa, Mint Chutney, Jalebi, Filter Coffee, Masala Chai.",
    image: "/snacks.png",
    rating: 4.6,
    votes: 342,
  },
  {
    type: "DINNER",
    name: "Vegetable Biryani, Raita, Gulab Jamun, Papad, Naan, Fried Rice.",
    image: "/dinner.png",
    rating: 4.5,
    votes: 189,
  },
];

const overviewData = [
  { title: "Overall Rating", value: "4.3", suffix: <Star className="w-[18px] h-[18px] text-orange-400 fill-orange-400 inline mb-1" />, subtitle: "4.1k Ratings" },
  { title: "Menu Updates", value: "6", subtitle: "This Week" },
  { title: "Active Users", value: "312", subtitle: " " },
  { title: "Feedback Volume", value: "120", subtitle: "new reviews" },
];

const chartData = [
  { name: "Mon", value: 4.3 },
  { name: "Tue", value: 4.2 },
  { name: "Wed", value: 4.15 },
  { name: "Thu", value: 4.32 },
  { name: "Fri", value: 4.1 },
  { name: "Sat", value: 4.34 },
  { name: "Sun", value: 4.25 },
];

export default function Dashboard() {
  return (
    <div className="px-8 pb-6 space-y-5">
      {/* Today's Menu Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          TODAY'S MENU
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayMenu.map((item) => (
            <div
              key={item.type}
              className="bg-white rounded-xl p-3 flex gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50"
            >
              <div className="w-[84px] h-[84px] rounded-lg overflow-hidden shrink-0 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center py-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-gray-900 text-base">
                    {item.type}
                  </h3>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-base flex items-center gap-1 justify-end">
                      {item.rating}
                      <Star className="w-[14px] h-[14px] text-orange-400 fill-orange-400 mb-0.5" />
                    </div>
                    <div className="text-gray-400 text-[11px] mt-0.5">
                      {item.votes} votes
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-[12px] leading-snug line-clamp-2 max-w-[85%] pr-2 mb-1.5">
                  {item.name}
                </p>
                <a
                  href="#"
                  className="text-blue-600 font-bold text-xs tracking-wider uppercase hover:text-blue-700 transition-colors"
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Overview Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          WEEKLY OVERVIEW
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {overviewData.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50"
            >
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
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Satisfaction Trend Section */}
      <section>
        <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-3">
          WEEKLY SATISFACTION TREND
        </h2>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                hide
              />
              <YAxis
                domain={[4.0, 4.5]}
                ticks={[4.0, 4.1, 4.2, 4.3, 4.4, 4.5]}
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
        </div>
      </section>
    </div>
  );
}
