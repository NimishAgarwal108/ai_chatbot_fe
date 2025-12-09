"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import { Typography } from "../custom/Typography";

// Type definitions
type Sender = "bot" | "user";

interface Message {
  sender: Sender;
  text: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = { sender: "user", text: input };
    setMessages([...messages, newMsg]);
    setInput("");

    // Fake bot reply
    setTimeout(() => {
      const botReply: Message = {
        sender: "bot",
        text: "Thanks for your message!",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 700);
  };

  return (
    <div className="flex-1 h-screen bg-slate-950 p-6 flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="bg-slate-800 border-slate-700 text-white"
        />

        <Button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white"
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
}: {
  sender: "user" | "bot";
  text: string;
}) {
  const isUser = sender === "user";

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
    </div>
  );
}
