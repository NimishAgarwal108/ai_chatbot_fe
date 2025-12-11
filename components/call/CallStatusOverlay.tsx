"use client";
import { CallStatus } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import { Maximize2, Minimize2 } from 'lucide-react';

interface CallStatusOverlayProps {
  callStatus: CallStatus;
  callDuration: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  formatDuration: (seconds: number) => string;
}

export default function CallStatusOverlay({
  callStatus,
  callDuration,
  isFullscreen,
  onToggleFullscreen,
  formatDuration
}: CallStatusOverlayProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
        <Typography variant="small" className="text-white">
          {callStatus === 'ringing' ? 'Connecting...' : formatDuration(callDuration)}
        </Typography>
      </div>
      <button
        onClick={onToggleFullscreen}
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 hover:bg-slate-800 transition-colors"
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
      </button>
    </div>
  );
}
