"use client";
import { CallStatus, CallType } from '@/app/call.types';
import { useEffect, useState } from 'react';
import ActiveCallScreen from './ActiveCallScreen';
import { CallEndedScreen } from './CallEndedScreen';
import CallInitScreen from './CallInitScreen';

export default function PhoneCall() {
  const [callType, setCallType] = useState<CallType>('voice');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle start call
  const handleStartCall = (type: CallType) => {
    setCallType(type);
    setCallStatus('ringing');
    if (type === 'voice') {
      setIsVideoEnabled(false);
    }
    // Simulate call connecting after 2 seconds
    setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
  };

  // Handle end call
  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
      setIsMuted(false);
      setIsVideoEnabled(true);
      setIsSpeakerOn(false);
    }, 2000);
  };

  // Toggle video (upgrade voice to video)
  const toggleVideo = () => {
    if (callType === 'voice') {
      setCallType('video');
      setIsVideoEnabled(true);
    } else {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {callStatus === 'idle' && (
        <CallInitScreen onStartCall={handleStartCall} />
      )}

      {(callStatus === 'ringing' || callStatus === 'connected') && (
        <ActiveCallScreen
          callType={callType}
          callStatus={callStatus}
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isSpeakerOn={isSpeakerOn}
          isFullscreen={isFullscreen}
          callDuration={callDuration}
          formatDuration={formatDuration}
          setIsMuted={setIsMuted}
          toggleVideo={toggleVideo}
          setIsSpeakerOn={setIsSpeakerOn}
          setIsFullscreen={setIsFullscreen}
          handleEndCall={handleEndCall}
        />
      )}

      {callStatus === 'ended' && <CallEndedScreen />}
    </div>
  );
}