"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
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
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Today's Menu", icon: Utensils, href: "/menu-today" },
  { name: "Weekly Analytics", icon: BarChart2, href: "/analytics" },
  { name: "View Reviews", icon: MessageSquare, href: "/reviews" },
  { name: "Mess Menu", icon: ImageIcon, href: "/menu" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function ReviewPage({ children, user }: { children: React.ReactNode, user?: any }) {
  const pathname = usePathname();

  const authRoutes = ["/login", "/signup"];
  if (authRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-6">
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.name === "Dashboard") ||
              (pathname.startsWith("/reviews") && item.name === "View Reviews");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-black text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
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
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-11 pr-4 h-10 rounded-full bg-white border-gray-200 focus-visible:ring-blue-500 text-sm w-64 shadow-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="relative w-10 h-10 rounded-full border-gray-100 text-gray-500 hover:text-gray-700 bg-white shadow-sm shrink-0">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-[8px] right-[10px] w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
