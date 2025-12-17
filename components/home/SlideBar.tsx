import {
  BarChart3,
  Bot,
  FileText,
  History,
  LogOut,
  Menu,
  MessageSquare,
  Phone,
  Settings,
  User,
  X,
} from "lucide-react";
import React from "react";
import { NavItem } from "../custom/NavBar";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-white">AI Chat Bot</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-white"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Chats" />
          <NavItem icon={<Phone className="w-5 h-5" />} label="Calls" />
          <NavItem icon={<History className="w-5 h-5" />} label="History" />
          <NavItem icon={<FileText className="w-5 h-5" />} label="Documents" />
          <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Analytics" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white">
                  John Doe
                </p>
                <p className="text-xs text-slate-400 truncate">
                  john@example.com
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
