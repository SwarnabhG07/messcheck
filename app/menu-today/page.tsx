"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TodayMenuPage() {
  const [menu, setMenu] = useState<{ meal: string; items: string; rating: string; votes: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          reviewsData = await reviewsRes.json();
        }

        if (menuRes.ok) {
          const data = await menuRes.json();
          if (data.tableData && data.tableData.length > 0) {
            const table = data.tableData;
            const headers = table[0];
            const today = dayjs().format("dddd"); // e.g., "Monday"
            
            const colIndex = headers.findIndex((h: string) => h.toLowerCase().includes(today.toLowerCase()));
            
            if (colIndex !== -1) {
              const todayMenu = [];
              for (let i = 1; i < table.length; i++) {
                const meal = (table[i][0] || `Meal ${i}`).trim();
                const items = table[i][colIndex] || "Not specified";
                
                // Calculate ratings
                const mealReviews = reviewsData.filter(r => r.for?.toUpperCase() === meal.toUpperCase());
                const totalRating = mealReviews.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0);
                const avg = mealReviews.length > 0 ? (totalRating / mealReviews.length).toFixed(1) : "0.0";
                
                todayMenu.push({ meal, items, rating: avg, votes: mealReviews.length });
              }
              setMenu(todayMenu);
            } else {
              setError(`Could not find menu for ${today}`);
            }
          } else {
             setError("Menu data not available.");
          }
        } else {
           setError("Failed to load menu.");
        }
      } catch (err) {
        setError("Error loading menu.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getMealImage = (mealName: string) => {
    const name = mealName.toLowerCase();
    if (name.includes("breakfast")) return "/breakfast.png";
    if (name.includes("lunch")) return "/lunch.png";
    if (name.includes("snack")) return "/snacks.png";
    if (name.includes("dinner")) return "/dinner.png";
    return "/lunch.png"; // Fallback
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (menu.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No menu items found for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
      <div className="space-y-3">
        {menu.map((m, idx) => (
          <Card key={idx} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row rounded-2xl group">
            <div className="relative sm:w-40 h-24 sm:h-auto shrink-0 overflow-hidden bg-gray-100">
              <Image 
                src={getMealImage(m.meal)} 
                alt={m.meal} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            
            <div className="px-4 pb-2.5 pt-2 sm:px-5 sm:pb-3 sm:pt-2.5 flex flex-col justify-start flex-1">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                  {m.meal}
                </h3>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 font-bold text-gray-900 bg-orange-50 px-1.5 py-0.5 rounded-md">
                    <span className="text-base leading-none">{m.rating}</span>
                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                  </div>
                  <span className="text-gray-400 text-xs font-medium mt-1">{m.votes} reviews</span>
                </div>
              </div>
              
              <p className="text-gray-600 group-hover:text-gray-900 text-base font-medium leading-relaxed transition-colors mt-1 mb-0.5">
                {m.items}
              </p>
              <Link
                href={`/menu-today/${m.meal.toLowerCase()}`}
                className="text-violet-600 font-bold text-[15px] tracking-wider uppercase hover:text-violet-700 transition-colors inline-block"
              >
                VIEW DETAILS
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
