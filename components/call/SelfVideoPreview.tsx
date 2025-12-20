import { User } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface SelfVideoPreviewProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

const SelfVideoPreview: React.FC<SelfVideoPreviewProps> = ({
  isListening,
  isSpeaking,
  isThinking,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize video stream
  useEffect(() => {
    const initVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false, // Audio is handled separately by useAICall
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        streamRef.current = stream;
        console.log('✅ Video stream initialized');
      } catch (err) {
        console.error('❌ Error accessing camera:', err);
      }
    };

    initVideoStream();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Get border color based on state
  const getBorderColor = () => {
    if (isListening) return 'border-red-500 shadow-lg shadow-red-500/50';
    if (isThinking) return 'border-yellow-500 shadow-lg shadow-yellow-500/50';
    if (isSpeaking) return 'border-blue-500 shadow-lg shadow-blue-500/50';
    return 'border-slate-600 shadow-lg shadow-slate-600/50';
  };

  // Get status badge color
  const getStatusBadge = () => {
    if (isListening) return { bg: 'bg-red-500', text: 'You\'re Speaking' };
    if (isThinking) return { bg: 'bg-yellow-500', text: 'Processing' };
    if (isSpeaking) return { bg: 'bg-blue-500', text: 'AI Speaking' };
    return { bg: 'bg-green-500', text: 'Ready' };
  };

  const status = getStatusBadge();

  return (
    <div className="absolute bottom-20 right-4 z-10">
      <div
        className={`w-48 aspect-video bg-slate-900 border-4 ${getBorderColor()} rounded-xl overflow-hidden relative transition-all duration-300 transform hover:scale-105`}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay when no video */}
        {!streamRef.current && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <User className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* User Label */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-white text-xs font-medium">You</span>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 ${status.bg} backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5`}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">{status.text}</span>
        </div>
      </div>
    </div>
  );
};

export default SelfVideoPreview;