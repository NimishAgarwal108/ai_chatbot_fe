import { CallStatus } from '@/app/call.types';
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
  const getStatusInfo = () => {
    switch (callStatus) {
      case 'ringing':
        return {
          text: 'Connecting...',
          color: 'bg-yellow-500',
          icon: '📞',
        };
      case 'connected':
        return {
          text: formatDuration(callDuration),
          color: 'bg-green-500',
          icon: '🟢',
        };
      case 'ended':
        return {
          text: 'Call Ended',
          color: 'bg-red-500',
          icon: '📵',
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-slate-500',
          icon: '❓',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 ${status.color} rounded-full animate-pulse`} />
        <span className="text-white text-sm font-medium">
          {status.icon} {status.text}
        </span>
      </div>
    </div>
  );
};