"use client";
import { CallType } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import { Clock, MessageSquare, Phone, Settings, Video } from 'lucide-react';
import { Feature } from './Feature';

interface CallInitScreenProps {
  onStartCall: (type: CallType) => void;
}

export default function CallInitScreen({ onStartCall }: CallInitScreenProps) {
  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg shadow-blue-500/50 animate-pulse">
          <Phone className="w-12 h-12 text-white" />
        </div>
        <Typography variant="h1" align="center" className="mb-4 text-white">
          AI Customer Support
        </Typography>
        <Typography variant="paragraph" align="center" className="text-slate-400 max-w-2xl mx-auto">
          Connect with our AI assistant through voice or video call. Get instant support 24/7 with human-like conversations.
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Voice Call Option */}
        <button
          onClick={() => onStartCall('voice')}
          className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <Typography variant="h3" align="center" className="mb-3 text-white">
            Voice Call
          </Typography>
          <Typography variant="small" align="center" className="text-slate-400 mb-4">
            Start an audio conversation with AI assistant
          </Typography>
          <div className="space-y-2">
            <Feature text="Crystal clear audio quality" />
            <Feature text="Real-time responses" />
            <Feature text="Natural conversation flow" />
          </div>
        </button>

        {/* Video Call Option */}
        <button
          onClick={() => onStartCall('video')}
          className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
            <Video className="w-8 h-8 text-white" />
          </div>
          <Typography variant="h3" align="center" className="mb-3 text-white">
            Video Call
          </Typography>
          <Typography variant="small" align="center" className="text-slate-400 mb-4">
            Face-to-face conversation with AI assistant
          </Typography>
          <div className="space-y-2">
            <Feature text="HD video quality" />
            <Feature text="Visual demonstrations" />
            <Feature text="Screen sharing support" />
          </div>
        </button>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <Typography variant="small" className="text-white font-semibold mb-1">
              24/7 Available
            </Typography>
            <Typography variant="small" className="text-slate-400">
              Always ready to help
            </Typography>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <Typography variant="small" className="text-white font-semibold mb-1">
              Instant Response
            </Typography>
            <Typography variant="small" className="text-slate-400">
              No wait time
            </Typography>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <Typography variant="small" className="text-white font-semibold mb-1">
              Smart AI
            </Typography>
            <Typography variant="small" className="text-slate-400">
              Understands context
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
