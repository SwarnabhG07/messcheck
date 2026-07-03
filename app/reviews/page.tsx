"use client";

import { Star } from "lucide-react";

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

export default function ReviewsPage() {
  return (
    <div className="px-8 pb-6 space-y-5">
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
    </div>
  );
}
