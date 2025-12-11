import { CallStatus, CallType } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import { Maximize2, Minimize2, Phone, User } from 'lucide-react';
import React from 'react';
import { CallStatusBadge } from './CallStatusBadge';
import SelfVideoPreview from './SelfVideoPreview';

interface CallVideoAreaProps {
  callType: CallType;
  callStatus: CallStatus;
  isVideoEnabled: boolean;
  isFullscreen: boolean;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  setIsFullscreen: (value: boolean) => void;
}

export const CallVideoArea: React.FC<CallVideoAreaProps> = ({
  callType,
  callStatus,
  isVideoEnabled,
  isFullscreen,
  callDuration,
  formatDuration,
  setIsFullscreen,
}) => {
  return (
    <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'} bg-gradient-to-br from-slate-800 to-slate-900`}>
      {callType === 'video' && isVideoEnabled ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse shadow-lg shadow-purple-500/50">
              <User className="w-16 h-16 text-white" />
            </div>
            <Typography variant="h3" className="text-white mb-2">
              AI Assistant
            </Typography>
            <Typography variant="small" className="text-slate-400">
              Video Connected
            </Typography>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse shadow-lg shadow-blue-500/50">
              <Phone className="w-16 h-16 text-white" />
            </div>
            <Typography variant="h3" className="text-white mb-2">
              AI Assistant
            </Typography>
            <Typography variant="small" className="text-slate-400">
              {callStatus === 'ringing' ? 'Connecting...' : 'Voice Call Active'}
            </Typography>
          </div>
        </div>
      )}

      {/* Call Status Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <CallStatusBadge
          callStatus={callStatus}
          callDuration={callDuration}
          formatDuration={formatDuration}
        />
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 hover:bg-slate-800 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Self Video Preview */}
      {callType === 'video' && isVideoEnabled && <SelfVideoPreview />}
    </div>
  );
};