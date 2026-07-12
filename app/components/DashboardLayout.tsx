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
    <div className="flex h-screen bg-[#f0f4f8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col py-6 transition-all duration-300 relative shrink-0 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className={`flex items-center mb-6 ${isSidebarCollapsed ? "justify-center px-0" : "justify-end px-4"}`}>
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
        <header className="sticky top-0 z-50 flex justify-between items-start px-8 pt-6 pb-4 bg-[#f0f4f8]/80 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight leading-tight">
              {headerTitle}
            </h1>
            <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mt-0.5">
              {dayjs().format('dddd, MMM D')}
            </p>
          </div>
          <div className="flex items-center gap-6 mt-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-11 pr-4 h-10 rounded-full bg-white border-gray-200 focus-visible:ring-blue-500 text-sm w-64 shadow-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="relative w-10 h-10 rounded-full border-gray-100 text-gray-500 hover:text-gray-700 bg-white shadow-sm shrink-0">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>

            {/* Profile with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                  <Avatar className="w-10 h-10 shadow-sm border border-gray-100">
                    <AvatarFallback className="bg-indigo-500 text-white font-semibold">
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
