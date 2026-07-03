"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Home,
  Utensils,
  BarChart2,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Search,
  Bell,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const menuItems = [
  { name: "Dashboard", icon: Home, active: true },
  { name: "Today's Menu", icon: Utensils, active: false },
  { name: "Weekly Analytics", icon: BarChart2, active: false },
  { name: "View Reviews", icon: MessageSquare, active: false },
  { name: "Mess Menu", icon: ImageIcon, active: false },
  { name: "Settings", icon: Settings, active: false },
];

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

const reviewsData = [
  {
    name: "Priya S.",
    rating: "4.0",
    text: "The Paneer was great today, but the roti was a little hard. Delivered slightly late as well.",
    for: "Lunch",
    time: "2 hrs ago",
  },
  {
    name: "Amit K.",
    rating: "5.0",
    text: "Loved the Biryani tonight! Best meal of the week so far. Highly recommend the Gulab Jamun.",
    for: "Dinner",
    time: "4 hrs ago",
  },
  {
    name: "Sneha R.",
    rating: "3.0",
    text: "Dosa was okay, but the Sambar was too watery today. Filter coffee was good though.",
    for: "Breakfast",
    time: "8 hrs ago",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("View Reviews");

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-6">
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = item.name === activeTab;
            return (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.name);
                }}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-black text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-start px-8 pt-6 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight leading-tight">
              MESS DASHBOARD
            </h1>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mt-0.5">
              WEDNESDAY, OCT 25
            </p>
          </div>
          <div className="flex items-center gap-6 mt-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                className="pl-11 pr-4 py-2.5 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 shadow-sm"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm border border-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
                R
              </div>
              <span className="text-gray-700 font-medium text-sm">Rahul</span>
            </div>
          </div>
        </header>

        <div className="px-8 pb-6 space-y-5">
          {activeTab === "Dashboard" && (
            <>
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
            </>
          )}

          {activeTab === "View Reviews" && (
            <section>
              <h2 className="text-gray-600 text-xs font-bold tracking-widest uppercase mb-4 mt-2">
                STUDENT REVIEWS
              </h2>
              <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
                {reviewsData.map((review, idx) => (
                  <div key={idx} className={`p-6 ${idx !== reviewsData.length - 1 ? 'border-b border-gray-100' : ''}`}>
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
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
