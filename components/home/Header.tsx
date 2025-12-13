"use client";

import { NAVIGATION_ROUTES } from "@/app/Constant";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
interface HeaderProps {
  notifications: number;
}

export const Header: React.FC<HeaderProps> = ({ notifications }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center justify-end p-4 relative">

        {/* New Chat Button */}
        <Link href={NAVIGATION_ROUTES.NEW_CHAT}>
        <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 text-white cursor-pointer">
          <Plus className="w-5 h-5" />
          New Chat
        </button></Link>

      </div>
    </header>
  );
};
