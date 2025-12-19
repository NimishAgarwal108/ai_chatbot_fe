"use client";

import { Typography } from "@/components/custom/Typography";
import { Bot, Loader2, Mic, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SelfVideoPreviewProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
}

export default function SelfVideoPreview({
  isListening,
  isSpeaking,
  isThinking = false,
}: SelfVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 🔹 Video URLs - Replace with your actual video paths
  const VIDEO_URLS = {
    listening: "/videos/listen.mp4",
    thinking: "/videos/thinking.mp4",
    talking: "/videos/talk.mp4",
  };

  // Fallback demo videos if your videos don't exist yet
  const DEMO_VIDEOS = {
    listening: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thinking: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    talking: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  };

  // Determine which video should play
  useEffect(() => {
    let videoToPlay = "";

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
        console.error("Error playing AI video:", error);
        // If video fails, try fallback
        if (isListening) video.src = DEMO_VIDEOS.listening;
        else if (isThinking) video.src = DEMO_VIDEOS.thinking;
        else if (isSpeaking) video.src = DEMO_VIDEOS.talking;
        
        try {
          await video.load();
          await video.play();
          setIsVideoLoaded(true);
        } catch (fallbackError) {
          console.error("Fallback video also failed:", fallbackError);
        }
      }
    };

    playVideo();

    return () => {
      video.pause();
    };
  }, [currentVideo, isListening, isThinking, isSpeaking]);

  // Get status text and color
  const getStatus = () => {
    if (isListening) return { text: "Listening", color: "red", icon: <Mic className="w-3 h-3 text-red-400 animate-pulse" /> };
    if (isThinking) return { text: "Thinking", color: "yellow", icon: <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" /> };
    if (isSpeaking) return { text: "Speaking", color: "blue", icon: <Loader2 className="w-3 h-3 text-blue-400 animate-spin" /> };
    return { text: "Ready", color: "green", icon: <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> };
  };

  const status = getStatus();

  return (
    <div className="absolute bottom-4 right-4 flex gap-3">
      {/* ================= USER SELF PREVIEW ================= */}
      <div className="w-32 h-24 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden relative shadow-lg">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
          <User className="w-8 h-8 text-slate-500" />
        </div>
        <div className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-sm rounded px-1.5 py-0.5">
          <Typography variant="small" className="text-white text-xs">
            You
          </Typography>
        </div>
      </div>

      {/* ================= AI VIDEO PREVIEW ================= */}
      <div className="w-32 h-24 bg-slate-900 border-2 border-indigo-700 rounded-lg overflow-hidden relative shadow-lg">
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Bot className="w-8 h-8 text-white opacity-50" />
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-1 right-1 ${
            status.color === "red"
              ? "bg-red-500/90"
              : status.color === "yellow"
              ? "bg-yellow-500/90"
              : status.color === "blue"
              ? "bg-blue-500/90"
              : "bg-green-500/90"
          } backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1`}
        >
          {status.icon}
          <Typography variant="small" className="text-white text-[10px] font-medium">
            {status.text}
          </Typography>
        </div>

        {/* AI Label */}
        <div className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
          <Bot className="w-3 h-3 text-indigo-400" />
          <Typography variant="small" className="text-white text-xs">
            AI
          </Typography>
        </div>
      </div>
    </div>
  );
}