"use client";
import { useState } from "react";
import { AIAssistantCard } from "../home/AiAssistantCard";
import { Header } from "../home/Header";
import { QuickActions } from "../home/QuickActionButton";
import { WelcomeSection } from "../home/WelcomSection";

export default function FirstWindow() {
  const [notifications] = useState(3);

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      
      {/* Header */}
      <Header notifications={notifications} />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Quick Actions */}
          <QuickActions />

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AIAssistantCard />
          </div>

        </div>
      </main>
    </div>
  );
}
