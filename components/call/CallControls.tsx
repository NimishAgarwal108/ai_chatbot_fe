import { CallType } from '@/app/call.types';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import React from 'react';

interface CallControlsProps {
  callType: CallType;
  isVideoEnabled: boolean;
  isAudioMuted: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  callType,
  isVideoEnabled,
  isAudioMuted,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Mute/Unmute Button */}
        <Button
          size="lg"
          variant="ghost"
          onClick={onToggleAudio}
          className={`rounded-full w-16 h-16 transition-all duration-300 ${
            isAudioMuted
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        {/* End Call Button */}
        <Button
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
          title="End Call"
        >
          <PhoneOff className="w-8 h-8" />
        </Button>

        {/* Video Toggle Button - Only show for video calls */}
        {callType === 'video' ? (
          <Button
            size="lg"
            variant="ghost"
            onClick={onToggleVideo}
            className={`rounded-full w-16 h-16 transition-all duration-300 ${
              !isVideoEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>
        ) : (
          <div className="w-16" /> // Spacer for symmetry
        )}
      </div>
    </div>
  );
};