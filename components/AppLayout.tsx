"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Utensils,
  BarChart2,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Search,
  Bell,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Today's Menu", icon: Utensils, href: "/menu-today" },
  { name: "Weekly Analytics", icon: BarChart2, href: "/analytics" },
  { name: "View Reviews", icon: MessageSquare, href: "/reviews" },
  { name: "Mess Menu", icon: ImageIcon, href: "/menu" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

        {children}
      </main>
    </div>
  );
}
