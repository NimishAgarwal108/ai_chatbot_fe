'use client';

import { Button } from '@/components/ui/button';
import { useAICall } from '@/hooks/useAICall';
import {
  Bot,
  Loader2,
  MessageSquare,
  Mic,
  PhoneOff,
  User,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AICallInterfaceProps {
  aiModel: string;
  callType: 'voice' | 'video';
  onEndCall: () => void;
}

export default function AICallInterface({ 
  aiModel, 
  callType, 
  onEndCall 
}: AICallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const aiVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const callInitializedRef = useRef(false); // ✅ NEW: Track if call was started

  const {
    isListening,
    isSpeaking,
    isThinking,
    messages,
    error,
    startCall,
    endCall,
    sendMessage,
  } = useAICall({
    callId: `ai-call-${Date.now()}`,
    userId: 'user-123',
    callType,
    aiModel,
    voiceSettings: {
      voice: 'alloy',
      speed: 1.0,
    },
  });

  // Video URLs for AI states
  const VIDEO_URLS = {
    listening: "/videos/listening.mp4",
    thinking: "/videos/thinking.mp4",
    talking: "/videos/talking.mp4",
  };

  // Fallback demo videos
  const DEMO_VIDEOS = {
    listening: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thinking: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    talking: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  };

  const [currentAIVideo, setCurrentAIVideo] = useState<string>("");

  // ✅ FIXED: Start call only once on mount
  useEffect(() => {
    if (!callInitializedRef.current) {
      callInitializedRef.current = true;
      startCall();
    }
    
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // ✅ Empty dependency array - runs only once

  // Initialize video stream for video calls
  useEffect(() => {
    if (callType === 'video' && videoRef.current) {
      initVideoStream();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [callType]);

  // Handle AI video changes
  useEffect(() => {
    let videoToPlay = "";
    
    if (isListening) {
      videoToPlay = VIDEO_URLS.listening;
    } else if (isThinking) {
      videoToPlay = VIDEO_URLS.thinking;
    } else if (isSpeaking) {
      videoToPlay = VIDEO_URLS.talking;
    }

    if (videoToPlay && videoToPlay !== currentAIVideo) {
      setCurrentAIVideo(videoToPlay);
      playAIVideo(videoToPlay);
    }
  }, [isListening, isThinking, isSpeaking]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAIVideo = async (videoUrl: string) => {
    const video = aiVideoRef.current;
    if (!video) return;

    try {
      video.src = videoUrl;
      await video.load();
      await video.play();
    } catch (error) {
      console.error("Error playing AI video:", error);
      // Try fallback video
      try {
        if (isListening) video.src = DEMO_VIDEOS.listening;
        else if (isThinking) video.src = DEMO_VIDEOS.thinking;
        else if (isSpeaking) video.src = DEMO_VIDEOS.talking;
        await video.load();
        await video.play();
      } catch (fallbackError) {
        console.error("Fallback video failed:", fallbackError);
      }
    }
  };

  const initVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const handleEndCall = () => {
    endCall();
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = () => {
    if (isListening) return { text: "Listening", color: "red", icon: <Mic className="w-5 h-5 animate-pulse" /> };
    if (isThinking) return { text: "Thinking", color: "yellow", icon: <Loader2 className="w-5 h-5 animate-spin" /> };
    if (isSpeaking) return { text: "Speaking", color: "blue", icon: <Loader2 className="w-5 h-5 animate-spin" /> };
    return { text: "Ready", color: "green", icon: <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" /> };
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">AI Assistant Call</h2>
            <p className="text-slate-400 text-sm">
              Model: {aiModel} • {formatDuration(callDuration)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {error && (
              <div className="text-red-300 text-sm bg-red-500/20 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-white hover:bg-white/10"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-9xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video/Avatar Area - Larger */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900 shadow-2xl">
                {callType === 'video' ? (
                  <>
                    {/* Main Background - Blurred */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />

                    {/* Video Previews Container - Centered and Larger */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="flex gap-6 w-full max-w-7xl">
                        {/* User Video Preview - Large */}
                        <div className="flex-1 aspect-video bg-slate-800 border-4 border-slate-600 rounded-2xl overflow-hidden relative shadow-2xl">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-400" />
                              <span className="text-white text-base font-medium">You</span>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              <span className="text-white text-sm font-medium">Live</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Video Preview - Large */}
                        <div className="flex-1 aspect-video bg-slate-900 border-4 border-indigo-600 rounded-2xl overflow-hidden relative shadow-2xl">
                          {currentAIVideo ? (
                            <video
                              ref={aiVideoRef}
                              loop
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                              <Bot className="w-24 h-24 text-white opacity-50" />
                            </div>
                          )}

                          {/* Status Badge - Larger */}
                          <div
                            className={`absolute top-4 right-4 ${
                              status.color === "red"
                                ? "bg-red-500/90"
                                : status.color === "yellow"
                                ? "bg-yellow-500/90"
                                : status.color === "blue"
                                ? "bg-blue-500/90"
                                : "bg-green-500/90"
                            } backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg`}
                          >
                            {status.icon}
                            <span className="text-white text-base font-bold">
                              {status.text}
                            </span>
                          </div>

                          {/* AI Label - Larger */}
                          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-indigo-400" />
                            <span className="text-white text-base font-medium">SumNex</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white/30 mb-4">
                        <Bot className="w-16 h-16 text-white" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full inline-flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isListening ? 'bg-red-500 animate-pulse' : 
                          isThinking ? 'bg-yellow-500 animate-pulse' :
                          isSpeaking ? 'bg-blue-500 animate-pulse' : 
                          'bg-green-500'
                        }`} />
                        <span className="text-white text-base font-medium">
                          {isListening ? 'Listening...' : 
                           isThinking ? 'Thinking...' :
                           isSpeaking ? 'SumNex Speaking...' : 
                           'Ready to listen'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden h-[500px]">
                {/* Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex-shrink-0">
                  <h3 className="text-white font-semibold text-lg">Conversation</h3>
                  <p className="text-slate-400 text-sm">{messages.length} messages</p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Conversation will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end min-h-full space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.type === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* AI Avatar */}
                          {message.type === "ai" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg break-words ${
                              message.type === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-white border border-slate-700"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.text}
                            </p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                message.type === "user"
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          {/* User Avatar */}
                          {message.type === "user" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Auto-scroll anchor */}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-full w-16 h-16 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>

            <Button
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600 text-white shadow-lg"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>

            <div className="w-16" /> {/* Spacer for symmetry */}
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              {isListening ? '🎤 Listening to your voice...' : 
               isThinking ? '🧠 SumNex is thinking...' :
               isSpeaking ? '🤖 SumNex is speaking...' : 
               '💬 Speak naturally - SumNex will respond automatically'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}