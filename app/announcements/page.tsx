"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Megaphone, Clock, Building, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [hostel, setHostel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

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
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate w-full break-all whitespace-normal line-clamp-1">{announcement.title}</h2>
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-slate-50 px-3 py-1.5 rounded-full shrink-0 border border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {dayjs(announcement.createdAt).format('MMMM D, YYYY • h:mm A')}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-5 line-clamp-2 break-all whitespace-normal">
                {announcement.content}
              </p>
              
              <div className="mb-6">
                <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-amber-700 hover:text-amber-800 hover:bg-amber-50" onClick={() => setSelectedAnnouncement(announcement)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Announcement
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t border-gray-50 text-sm text-gray-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shadow-sm">
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

      {/* View Announcement Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-gray-100 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 break-words break-all">{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription className="text-sm font-semibold text-amber-600 flex items-center gap-2 pt-1">
              <Clock className="w-4 h-4" />
              {selectedAnnouncement ? dayjs(selectedAnnouncement.createdAt).format('MMMM D, YYYY • h:mm A') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words break-all max-h-[300px] overflow-y-auto pr-2">
              {selectedAnnouncement?.content}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t border-gray-50 text-sm text-gray-500">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shadow-sm">
                {selectedAnnouncement?.authorName?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="font-semibold text-gray-700">{selectedAnnouncement?.authorName || "Admin"}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-medium">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{selectedAnnouncement?.college} <span className="mx-1 text-gray-300">•</span> {selectedAnnouncement?.hostel}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
