"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Megaphone, Clock, Building } from "lucide-react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [hostel, setHostel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements) {
          setAnnouncements(data.announcements);
        }
        if (data.hostel) {
          setHostel(data.hostel);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">


      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-gray-100 p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No announcements yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">When important notices are posted for your hostel, they will appear right here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="bg-white rounded-[24px] border border-gray-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-5">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{announcement.title}</h2>
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-slate-50 px-3 py-1.5 rounded-full shrink-0 border border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {dayjs(announcement.createdAt).format('MMMM D, YYYY • h:mm A')}
                </span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-6">
                {announcement.content}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t border-gray-50 text-sm text-gray-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shadow-sm">
                    {announcement.authorName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="font-semibold text-gray-700">{announcement.authorName || "Admin"}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-medium">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{announcement.college} <span className="mx-1 text-gray-300">•</span> {announcement.hostel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
