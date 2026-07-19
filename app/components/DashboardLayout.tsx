"use client";

import { useState, useEffect } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Home,
  Utensils,
  BarChart2,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  ShieldAlert,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Today's Menu", icon: Utensils, href: "/menu-today" },
  { name: "Analytics", icon: BarChart2, href: "/analytics" },
  { name: "View Reviews", icon: MessageSquare, href: "/reviews" },
  { name: "Mess Menu", icon: ImageIcon, href: "/menu" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadAt, setLastReadAt] = useState<Date | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as any)?.role;
  const pathname = usePathname();

  const filteredMenuItems = userRole === "supreme_leader" 
    ? [...menuItems, { name: "Admin", icon: ShieldAlert, href: "/admin" }]
    : menuItems;

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/announcements")
        .then((res) => res.json())
        .then((data) => {
          if (data.announcements) setAnnouncements(data.announcements);
          if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
          if (data.lastReadAt) setLastReadAt(new Date(data.lastReadAt));
        })
        .catch(console.error);
    }
  }, [session?.user?.email]);

  const handleDropdownOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      setLastReadAt(new Date());
      fetch("/api/announcements/read", { method: "POST" }).catch(console.error);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to post announcement");
        return;
      }
      setAnnouncements([data.announcement, ...announcements]);
      setNewTitle("");
      setNewContent("");
      setIsAnnouncementOpen(false);
    } catch (error) {
      console.error("Failed to post");
      alert("An unexpected error occurred while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  const authRoutes = ["/login", "/signup", "/onboarding"];
  if (authRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  const activeMenuItem = filteredMenuItems.find(
    (item) =>
      pathname === item.href ||
      (pathname === "/" && item.name === "Dashboard") ||
      (pathname.startsWith("/reviews") && item.name === "View Reviews")
  );

  const headerTitle = pathname.startsWith("/announcements") 
    ? "ANNOUNCEMENTS" 
    : (activeMenuItem 
      ? (activeMenuItem.name === "Dashboard" ? "MESS DASHBOARD" : activeMenuItem.name.toUpperCase())
      : "MESS DASHBOARD");

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col py-6 transition-all duration-300 z-[60] h-full shrink-0 ${isSidebarCollapsed ? "relative w-20" : "absolute left-0 top-0 md:relative w-64 shadow-[4px_0_24px_rgba(0,0,0,0.05)] md:shadow-none"}`}>
        <div className={`flex items-center mb-6 mt-2 ${isSidebarCollapsed ? "flex-col gap-4 justify-center px-0" : "justify-between px-4"}`}>
          <div className="flex items-center gap-2">
            <img src="/spoon-and-fork-stroke-rounded.svg" alt="MessCheck Logo" className="w-7 h-7" />
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 tracking-tight">MESSCHECK</span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors bg-white border border-gray-200 shadow-sm"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav className={`flex-1 space-y-2 flex flex-col ${isSidebarCollapsed ? "px-3" : "px-4"}`}>
          {filteredMenuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.name === "Dashboard") ||
              (pathname.startsWith("/reviews") && item.name === "View Reviews");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 py-2.5 rounded-xl transition-colors ${
                  isSidebarCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-black text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 flex justify-between items-start px-4 md:px-8 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md">
          <div className="shrink min-w-0 pr-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#1e293b] tracking-tight leading-tight truncate">
              {headerTitle}
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs font-semibold tracking-wider uppercase mt-0.5 truncate">
              {dayjs().format('dddd, MMM D')}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 mt-1 shrink-0">

            {/* Write Announcement Dialog */}
            {(userRole === "mess_secretary" || userRole === "supreme_leader") && (
              <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm rounded-full px-3 md:px-5 h-10 transition-all font-medium border-0">
                    <Megaphone className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">Write Announcement</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-100 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">New Announcement</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Write an announcement that will be visible to all users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2 min-w-0 w-full">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                        <span className={`text-xs ${newTitle.length > 90 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {newTitle.length}/100
                        </span>
                      </div>
                      <Input id="title" placeholder="e.g. Special Dinner Tonight" className="rounded-lg border-gray-200 focus-visible:ring-amber-500 w-full max-w-full overflow-hidden text-ellipsis" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={100} />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0 w-full">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="content" className="text-sm font-medium text-gray-700">Content</Label>
                        <span className={`text-xs ${newContent.length > 450 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {newContent.length}/500
                        </span>
                      </div>
                      <Textarea id="content" placeholder="Write your announcement here..." className="rounded-lg border-gray-200 min-h-[100px] max-h-[150px] overflow-y-auto focus-visible:ring-amber-500 w-full max-w-full break-words break-all" value={newContent} onChange={(e) => setNewContent(e.target.value)} maxLength={500} style={{ fieldSizing: 'fixed' } as any} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAnnouncementOpen(false)} className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50" disabled={isPosting}>Cancel</Button>
                    <Button className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white" onClick={handlePostAnnouncement} disabled={isPosting || !newTitle.trim() || !newContent.trim()}>{isPosting ? "Posting..." : "Post Announcement"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Notifications Dropdown */}
            <DropdownMenu onOpenChange={handleDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative w-10 h-10 rounded-full border-gray-100 text-gray-500 hover:text-gray-700 bg-white shadow-sm shrink-0 outline-none">
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl p-0 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] border-gray-100 overflow-hidden mt-2">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Announcements</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                    {announcements.filter(a => !lastReadAt || new Date(a.createdAt) > lastReadAt).length} New
                  </span>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No announcements yet</div>
                  ) : announcements.slice(0, 3).map((announcement) => {
                    const isUnread = !lastReadAt || new Date(announcement.createdAt) > lastReadAt;
                    return (
                      <Link key={announcement._id} href="/announcements" className="block">
                        <div className={`px-4 py-3 border-b border-gray-50 flex flex-col gap-1 cursor-pointer transition-colors ${isUnread ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{announcement.title}</span>
                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />}
                          </div>
                          <span className="text-xs text-gray-500">{dayjs(announcement.createdAt).format('MMM D, h:mm A')}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="p-2 bg-slate-50 border-t border-gray-100 flex justify-center">
                  <Link href="/announcements" className="w-full">
                    <Button variant="ghost" className="w-full text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg h-9">
                      View all announcements
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                  <Avatar className="w-10 h-10 shadow-sm border border-gray-100">
                    <AvatarFallback className="bg-amber-600 text-white font-semibold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-gray-700 font-medium text-sm">
                    {user?.name || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] border-gray-100">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 mx-2" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="rounded-lg cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                >
                  <div className="flex items-center gap-3 px-1 py-1 text-sm w-full">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
