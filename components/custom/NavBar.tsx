// components/custom/NavBar.tsx
"use client";

import { NAVIGATION_ROUTES } from "@/app/Constant";
import { cn } from "@/lib/utils";
import {
  Home,
  Library,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Typography } from "./Typography";

interface Conversation {
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NavBar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedId = localStorage.getItem("conversationId");
    if (storedId) {
      setCurrentConversationId(storedId);
    }
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    if (!API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_URL is not set");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversations`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    localStorage.removeItem("conversationId");
    setCurrentConversationId(null);
    window.location.reload();
  };

  const loadConversation = (conversationId: string) => {
    localStorage.setItem("conversationId", conversationId);
    setCurrentConversationId(conversationId);
    window.location.reload();
  };

  const deleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    if (!API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_URL is not set");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setConversations((prev) =>
          prev.filter((c) => c.conversationId !== conversationId)
        );

        if (currentConversationId === conversationId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const getConversationPreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return (
      lastMessage?.content.slice(0, 40) +
      (lastMessage?.content.length > 40 ? "..." : "")
    );
  };

  const formatDate = (date: Date) => {
    if (!isMounted) return "";

    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString();
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col space-y-6">
      <div className="w-full flex items-center justify-center pb-2">
        <Logo />
      </div>

      <Typography
        variant="h3"
        weight="semibold"
        className="text-white tracking-tight hover:text-red-600 cursor-pointer"
      >
        Dashboard
      </Typography>

      <div className="space-y-3">
        <Link href={NAVIGATION_ROUTES.NEW_CHAT}>
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="text-white" />
            <Typography variant="paragraph" className="text-white">
              New Chat
            </Typography>
          </button>
        </Link>

        <Link href={NAVIGATION_ROUTES.CHAT_WINDOW}>
          <NavItem icon={Home} label="Home" />
        </Link>
        <NavItem icon={Search} label="Search" />
        <Link href={NAVIGATION_ROUTES.CALL_WINDOW}>
          <NavItem icon={Phone} label="Call" />
        </Link>
        <NavItem icon={Library} label="Library" />
        <Link href={NAVIGATION_ROUTES.PROFILE}>
          <NavItem icon={User} label="Profile" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pt-4 border-t border-slate-800">
        <Typography variant="small" className="text-slate-400 px-2">
          Recent Chats
        </Typography>

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : conversations.length === 0 ? (
          <Typography
            variant="small"
            className="text-slate-500 text-center px-2 py-4"
          >
            No conversations yet
          </Typography>
        ) : (
          conversations.slice(0, 5).map((conversation) => (
            <div
              key={conversation.conversationId}
              onClick={() => loadConversation(conversation.conversationId)}
              className={cn(
                "group relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all",
                currentConversationId === conversation.conversationId
                  ? "bg-slate-800"
                  : "hover:bg-slate-800/50"
              )}
            >
              <MessageSquare className="w-4 h-4 mt-1 shrink-0 text-slate-400" />

              <div className="flex-1 min-w-0">
                <Typography
                  variant="small"
                  className="text-slate-300 truncate"
                >
                  {getConversationPreview(conversation) || "New conversation"}
                </Typography>
                {isMounted && (
                  <Typography
                    variant="small"
                    className="text-slate-500 text-xs"
                  >
                    {formatDate(conversation.updatedAt)}
                  </Typography>
                )}
              </div>

              <button
                onClick={(e) =>
                  deleteConversation(conversation.conversationId, e)
                }
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                title="Delete conversation"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function NavItem({
  icon: Icon,
  label,
  active,
  sidebarOpen = true,
  badge,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  sidebarOpen?: boolean;
  badge?: string;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
        "hover:bg-slate-800 transition-all cursor-pointer group",
        active && "bg-slate-800"
      )}
    >
      <span className="text-slate-400 group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </span>

      {sidebarOpen && (
        <>
          <Typography
            variant="paragraph"
            className="text-slate-300 group-hover:text-white transition-colors flex-1 text-left"
          >
            {label}
          </Typography>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}
