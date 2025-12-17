// ============================================
// File: app/(pages)/Call/page.tsx
// AI-Only Call System (No external AIModelSelector)
// ============================================
"use client"
import AICallInterface from "@/components/call/AICallInterface";
import NavBar from "@/components/custom/NavBar";
import { Bot, Phone, Video } from "lucide-react";
import { useState } from "react";



export default function CallPage() {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isInCall, setIsInCall] = useState(false);

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  // If in call, show full-screen AI interface
  if (isInCall) {
    return (
      <AICallInterface
        aiModel={selectedModel}
        callType={callType}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="w-full h-screen flex bg-background overflow-hidden">
      {/* LEFT SIDE — NAVIGATION */}
      <div className="border-r border-slate-800">
        <NavBar />
      </div>

      {/* RIGHT SIDE — AI CALL SETUP */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              AI Voice Assistant
            </h1>
            <p className="text-slate-400 text-lg">
              Start a conversation with your AI assistant
            </p>
          </div>

          {/* Model Selection */}
          

          {/* Call Type Selection */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Choose Call Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Call */}
              <button
                onClick={() => handleStartCall('voice')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
                    <Phone className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Voice Call</h3>
                    <p className="text-blue-100">
                      Talk naturally with AI assistant
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-800/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {/* Video Call */}
              <button
                onClick={() => handleStartCall('video')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
                    <Video className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Video Call</h3>
                    <p className="text-purple-100">
                      See yourself while talking to AI
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-800/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800 p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-white mb-2">Instant Response</h4>
              <p className="text-sm text-slate-400">Get answers in real-time</p>
            </div>
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800 p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-semibold text-white mb-2">Secure & Private</h4>
              <p className="text-sm text-slate-400">Your conversations are safe</p>
            </div>
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800 p-6 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h4 className="font-semibold text-white mb-2">Multi-language</h4>
              <p className="text-sm text-slate-400">Speak in your language</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}