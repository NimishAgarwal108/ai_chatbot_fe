"use client";

import { cn } from "@/lib/utils";
import { Home, Library, Search, User } from "lucide-react";
import Logo from "./Logo";
import { Typography } from "./Typography";

export default function NavBar() {
  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col space-y-6">
      <div className="w-full flex items-center justify-center pb-2">
        <Logo/>
      </div>
      {/* Title */}
      <Typography
        variant="h3"
        weight="semibold"
        className="text-white tracking-tight"
      >
        Dashboard
      </Typography>

      {/* Menu */}
      <div className="space-y-3">
        <NavItem icon={<Home />} label="New Chat" />
        <NavItem icon={<Search />} label="Search" />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" />
      </div>
    </div>
  );
}

function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
        "hover:bg-slate-800 transition-all cursor-pointer group"
      )}
    >
      <span className="text-slate-400 group-hover:text-white transition-colors">
        {icon}
      </span>

      <Typography
        variant="paragraph"
        className="text-slate-300 group-hover:text-white transition-colors"
      >
        {label}
      </Typography>
    </button>
  );
}
