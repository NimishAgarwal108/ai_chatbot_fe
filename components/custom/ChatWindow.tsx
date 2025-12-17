"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Typography } from "../custom/Typography";

type Sender = "bot" | "user";

interface Message {
  sender: Sender;
  text: string;
  timestamp: Date;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I assist you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CHAT_API!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversationId: localStorage.getItem("conversationId") || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (data.conversationId) {
        localStorage.setItem("conversationId", data.conversationId);
      }

      const botReply: Message = {
        sender: "bot",
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex-1 h-screen bg-slate-950 p-6 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-10 mt-10">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp}
            isMounted={isMounted}
          />
        ))}
        {isLoading && (
          <div className="max-w-lg mr-auto bg-slate-800 p-4 rounded-xl flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <Typography variant="paragraph" className="text-slate-300">
              Thinking...
            </Typography>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="bg-slate-800 border-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <Button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-1" /> Send
        </Button>
      </div>
    </div>
  );
}

function ChatBubble({
  sender,
  text,
  timestamp,
  isMounted = true,
}: {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  isMounted?: boolean;
}) {
  const isUser = sender === "user";

  const formattedTime = isMounted
    ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div
      className={cn(
        "max-w-lg p-4 rounded-xl",
        isUser ? "ml-auto bg-blue-600" : "mr-auto bg-slate-800"
      )}
    >
      <Typography variant="paragraph" className="text-white">
        {text}
      </Typography>
      <Typography variant="small" className="text-slate-300 opacity-60 mt-1">
        {formattedTime}
      </Typography>
    </div>
  );
}
