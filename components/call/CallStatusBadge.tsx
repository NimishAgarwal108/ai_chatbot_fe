import { CallStatus } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import React from 'react';

interface CallStatusBadgeProps {
  callStatus: CallStatus;
  callDuration: number;
  formatDuration: (seconds: number) => string;
}

export const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({
  callStatus,
  callDuration,
  formatDuration,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
      }`}></div>
      <Typography variant="small" className="text-white">
        {callStatus === 'ringing' ? 'Connecting...' : formatDuration(callDuration)}
      </Typography>
    </div>
  );
};