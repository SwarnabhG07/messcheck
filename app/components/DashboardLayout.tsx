"use client";

import { useState } from "react";

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
  const [announcements] = useState([
    { id: 1, title: "Mess Timings Changed", date: "10 mins ago", unread: true },
    { id: 2, title: "Special Dinner Tonight", date: "2 hours ago", unread: true },
    { id: 3, title: "Menu Updated for Next Week", date: "1 day ago", unread: false },
  ]);
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const authRoutes = ["/login", "/signup", "/onboarding"];
  if (authRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  const activeMenuItem = menuItems.find(
    (item) =>
      pathname === item.href ||
      (pathname === "/" && item.name === "Dashboard") ||
      (pathname.startsWith("/reviews") && item.name === "View Reviews")
  );

  const headerTitle = activeMenuItem 
    ? (activeMenuItem.name === "Dashboard" ? "MESS DASHBOARD" : activeMenuItem.name.toUpperCase())
    : "MESS DASHBOARD";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col py-6 transition-all duration-300 relative shrink-0 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
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
          {menuItems.map((item) => {
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
        <header className="sticky top-0 z-50 flex justify-between items-start px-8 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight leading-tight">
              {headerTitle}
            </h1>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mt-0.5">
              {dayjs().format('dddd, MMM D')}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1">

            {/* Write Announcement Dialog */}
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm rounded-full px-5 h-10 transition-all font-medium border-0">
                  <Megaphone className="w-4 h-4" />
                  <span className="text-sm">Write Announcement</span>
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
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                    <Input id="title" placeholder="e.g. Special Dinner Tonight" className="rounded-lg border-gray-200 focus-visible:ring-violet-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="content" className="text-sm font-medium text-gray-700">Content</Label>
                    <Textarea id="content" placeholder="Write your announcement here..." className="rounded-lg border-gray-200 min-h-[100px] focus-visible:ring-violet-500" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAnnouncementOpen(false)} className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</Button>
                  <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setIsAnnouncementOpen(false)}>Post Announcement</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative w-10 h-10 rounded-full border-gray-100 text-gray-500 hover:text-gray-700 bg-white shadow-sm shrink-0 outline-none">
                  <Bell className="w-4.5 h-4.5" />
                  {announcements.some(a => a.unread) && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl p-0 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] border-gray-100 overflow-hidden mt-2">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Announcements</h3>
                  <span className="text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full">
                    {announcements.filter(a => a.unread).length} New
                  </span>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className={`px-4 py-3 border-b border-gray-50 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors ${announcement.unread ? 'bg-violet-50/30' : ''}`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${announcement.unread ? 'text-gray-900' : 'text-gray-700'}`}>{announcement.title}</span>
                        {announcement.unread && <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-500">{announcement.date}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 border-t border-gray-100">
                  <Button variant="ghost" className="w-full text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg h-9">
                    View all announcements
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                  <Avatar className="w-10 h-10 shadow-sm border border-gray-100">
                    <AvatarFallback className="bg-violet-600 text-white font-semibold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 font-medium text-sm">
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
