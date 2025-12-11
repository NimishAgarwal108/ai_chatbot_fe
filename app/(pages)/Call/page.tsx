// ============================================
// File: CallPage.tsx
// Full UI Preview Page (Matte Black Theme)
// ============================================
"use client"
import { useState } from "react";

import PhoneCall from "@/components/call/PhoneCall";
import NavBar from "@/components/custom/NavBar";



export default function CallPage() {
  // Fake preview duration
  const [duration] = useState(85);
  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  return (
    
    <div className="w-full h-screen flex bg-background overflow-hidden">
    
          {/* LEFT SIDE — NAVIGATION (1/4 width) */}
          <div className="border-r border-slate-800">
            <NavBar/>
          </div>
    
          {/* RIGHT SIDE — CHAT WINDOW (3/4 width) */}
          <div className="w-4/4">
           <PhoneCall/>
          </div>
    
        </div>


  );
}
