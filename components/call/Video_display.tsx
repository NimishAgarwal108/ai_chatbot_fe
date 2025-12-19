"use client";
import { CallStatus, CallType } from "@/app/call.types";
import { Typography } from "@/components/custom/Typography";
import { Loader2, Mic, Phone, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Video URLs - Replace these paths with your actual video files
const VIDEO_URLS = {
  listening: "/videos/listening.mp4",
  thinking: "/videos/thinking.mp4",
  talking: "/videos/talking.mp4"
};

interface VideoDisplayProps {
  callType: CallType;
  callStatus: CallStatus;
  isVideoEnabled: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
}

export default function VideoDisplay({
  callType,
  callStatus,
  isVideoEnabled,
  isListening = false,
  isSpeaking = false,
  isThinking = false,
}: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Determine which video should play based on AI state
  useEffect(() => {
    let videoToPlay = "";
    
    // Priority: Listening > Thinking > Speaking
    if (isListening) {
      videoToPlay = VIDEO_URLS.listening;
    } else if (isThinking) {
      videoToPlay = VIDEO_URLS.thinking;
    } else if (isSpeaking) {
      videoToPlay = VIDEO_URLS.talking;
    }

    // Only update if the video changed
    if (videoToPlay && videoToPlay !== currentVideo) {
      setCurrentVideo(videoToPlay);
      setIsVideoLoaded(false);
    }
  }, [isListening, isThinking, isSpeaking, currentVideo]);

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    const playVideo = async () => {
      try {
        video.src = currentVideo;
        await video.load();
        await video.play();
        setIsVideoLoaded(true);
      } catch (error) {
        console.error("Error playing video:", error);
      }
    };

    playVideo();

    return () => {
      video.pause();
    };
  }, [currentVideo]);

  // Status text helper
  const getStatusText = () => {
    if (isListening) return "Listening to you...";
    if (isThinking) return "Thinking...";
    if (isSpeaking) return "AI is speaking...";
    return "Ready to listen";
  };

  // Status color helper
  const getStatusColor = () => {
    if (isListening) return "red";
    if (isThinking) return "yellow";
    if (isSpeaking) return "blue";
    return "green";
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {callType === "video" && isVideoEnabled ? (
        <div className="text-center w-full h-full flex flex-col items-center justify-center">
          {/* Video Container */}
          <div className="relative w-full max-w-2xl aspect-video mb-4 rounded-2xl overflow-hidden shadow-2xl">
            {currentVideo ? (
              <>
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loop
                  muted
                  playsInline
                />
                {!isVideoLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            
            {/* Status Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div
                className={`${
                  statusColor === "red"
                    ? "bg-red-500/90"
                    : statusColor === "yellow"
                    ? "bg-yellow-500/90"
                    : statusColor === "blue"
                    ? "bg-blue-500/90"
                    : "bg-green-500/90"
                } backdrop-blur-sm px-6 py-3 rounded-full inline-flex items-center gap-3 shadow-lg`}
              >
                {isListening && <Mic className="w-5 h-5 text-white animate-pulse" />}
                {isThinking && <Loader2 className="w-5 h-5 text-white animate-spin" />}
                {isSpeaking && (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
                {!isListening && !isThinking && !isSpeaking && (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                )}
                <span className="text-white text-base font-medium">{statusText}</span>
              </div>
            </div>
          </div>

          <Typography variant="h3" className="text-white mb-2">
            AI Assistant
          </Typography>
          <Typography variant="small" className="text-slate-400">
            Video Connected
          </Typography>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse shadow-lg shadow-blue-500/50">
            <Phone className="w-16 h-16 text-white" />
          </div>
          <Typography variant="h3" className="text-white mb-2">
            AI Assistant
          </Typography>
          <Typography variant="small" className="text-slate-400 mb-4">
            {callStatus === "ringing" ? "Connecting..." : "Voice Call Active"}
          </Typography>

          {/* Voice Status Indicator */}
          <div className="flex justify-center">
            <div
              className={`${
                statusColor === "red"
                  ? "bg-red-500/20"
                  : statusColor === "yellow"
                  ? "bg-yellow-500/20"
                  : statusColor === "blue"
                  ? "bg-blue-500/20"
                  : "bg-green-500/20"
              } backdrop-blur-sm px-6 py-3 rounded-full inline-flex items-center gap-3`}
            >
              {isListening && <Mic className="w-5 h-5 text-red-400 animate-pulse" />}
              {isThinking && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
              {isSpeaking && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
              {!isListening && !isThinking && !isSpeaking && (
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
              <span
                className={`${
                  statusColor === "red"
                    ? "text-red-300"
                    : statusColor === "yellow"
                    ? "text-yellow-300"
                    : statusColor === "blue"
                    ? "text-blue-300"
                    : "text-green-300"
                } text-base font-medium`}
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}