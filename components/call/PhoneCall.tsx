// ============================================
// File: components/call/PhoneCall.tsx
// Updated for AI Calls Only
// ============================================
"use client"
import { useState } from "react";
import { Bot, Phone, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhoneCall() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4 animate-pulse">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            AI Voice Assistant
          </h1>
          <p className="text-slate-400 text-lg">
            Choose your AI model and start calling
          </p>
        </div>

        {/* Model Selection */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Select AI Model
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'gpt-4', name: 'GPT-4', color: 'from-green-500 to-emerald-600' },
              { id: 'gpt-3.5-turbo', name: 'GPT-3.5', color: 'from-blue-500 to-cyan-600' },
              { id: 'claude-3', name: 'Claude 3', color: 'from-purple-500 to-pink-600' },
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${selectedModel === model.id
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }
                `}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-white">{model.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Call Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-32 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex flex-col items-center gap-3">
              <Phone className="w-8 h-8" />
              <div>
                <div className="font-semibold text-lg">Voice Call</div>
                <div className="text-xs text-blue-100">Audio only</div>
              </div>
            </div>
          </Button>

          <Button
            size="lg"
            className="h-32 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex flex-col items-center gap-3">
              <Video className="w-8 h-8" />
              <div>
                <div className="font-semibold text-lg">Video Call</div>
                <div className="text-xs text-purple-100">With camera</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Info */}
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400 text-center">
            🤖 Only AI assistant calls are available. No human-to-human calls.
          </p>
        </div>
      </div>
    </div>
  );
}