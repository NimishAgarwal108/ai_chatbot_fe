"use client";
import { CallType } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import {
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callType: CallType;
  setIsMuted: (value: boolean) => void;
  toggleVideo: () => void;
  setIsSpeakerOn: (value: boolean) => void;
  handleEndCall: () => void;
}

export default function CallControls({
  isMuted,
  isVideoEnabled,
  isSpeakerOn,
  callType,
  setIsMuted,
  toggleVideo,
  setIsSpeakerOn,
  handleEndCall
}: CallControlsProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center gap-4">
        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>

        {/* Video Toggle Button */}
        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            !isVideoEnabled && callType === 'video'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          {isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/50"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>

        {/* Speaker Button */}
        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isSpeakerOn
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
        </button>

        {/* More Options Button */}
        <button className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all">
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Control Labels */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <Typography variant="small" className="text-slate-400 text-xs w-14 text-center">
          {isMuted ? 'Unmute' : 'Mute'}
        </Typography>
        <Typography variant="small" className="text-slate-400 text-xs w-14 text-center">
          {isVideoEnabled ? 'Video' : 'No Video'}
        </Typography>
        <Typography variant="small" className="text-red-400 text-xs w-16 text-center font-semibold">
          End Call
        </Typography>
        <Typography variant="small" className="text-slate-400 text-xs w-14 text-center">
          {isSpeakerOn ? 'Speaker' : 'Audio'}
        </Typography>
        <Typography variant="small" className="text-slate-400 text-xs w-14 text-center">
          More
        </Typography>
      </div>
    </div>
  );
}