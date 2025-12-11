"use client";
import { CallStatus, CallType } from '@/app/call.types';
import CallControls from './CallControls';
import CallStatusOverlay from './CallStatusOverlay';
import SelfVideoPreview from './SelfVideoPreview';
import VideoDisplay from "./Video_display";

interface ActiveCallScreenProps {
  callType: CallType;
  callStatus: CallStatus;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  isFullscreen: boolean;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  setIsMuted: (value: boolean) => void;
  toggleVideo: () => void;
  setIsSpeakerOn: (value: boolean) => void;
  setIsFullscreen: (value: boolean) => void;
  handleEndCall: () => void;
}

export default function ActiveCallScreen({
  callType,
  callStatus,
  isMuted,
  isVideoEnabled,
  isSpeakerOn,
  isFullscreen,
  callDuration,
  formatDuration,
  setIsMuted,
  toggleVideo,
  setIsSpeakerOn,
  setIsFullscreen,
  handleEndCall
}: ActiveCallScreenProps) {
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full max-w-4xl'}`}>
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Video Area */}
        <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'} bg-gradient-to-br from-slate-800 to-slate-900`}>
          <VideoDisplay
            callType={callType}
            callStatus={callStatus}
            isVideoEnabled={isVideoEnabled}
          />

          <CallStatusOverlay
            callStatus={callStatus}
            callDuration={callDuration}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            formatDuration={formatDuration}
          />

          {/* Self Video Preview (for video calls) */}
          {callType === 'video' && isVideoEnabled && <SelfVideoPreview />}
        </div>

        {/* Call Controls */}
        <CallControls
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isSpeakerOn={isSpeakerOn}
          callType={callType}
          setIsMuted={setIsMuted}
          toggleVideo={toggleVideo}
          setIsSpeakerOn={setIsSpeakerOn}
          handleEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
