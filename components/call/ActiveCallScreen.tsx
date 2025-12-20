import { CallStatus, CallType } from '@/app/call.types';
import { useAICall } from '@/hooks/useAICall';
import { Bot, MessageSquare, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CallControls } from './CallControls';
import { CallVideoArea } from './CallVideoArea';

interface ActiveCallScreenProps {
  callType: CallType;
  aiModel: string;
  onEndCall: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  callType,
  aiModel,
  onEndCall,
}) => {
  // Call state
  const [callStatus, setCallStatus] = useState<CallStatus>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Refs
  const callInitializedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI Voice Call Hook
  const {
    isListening,
    isSpeaking,
    isThinking,
    messages,
    error,
    startCall,
    endCall,
  } = useAICall({
    callId: `ai-call-${Date.now()}`,
    userId: 'user-123',
    callType: callType,
    aiModel,
    voiceSettings: {
      voice: 'nova',
      speed: 1.0,
    },
  });

  // Start call once on mount
  useEffect(() => {
    if (!callInitializedRef.current) {
      callInitializedRef.current = true;
      console.log('🚀 Initializing AI call...');
      
      // Add delay to ensure backend is ready
      setCallStatus('ringing');
      
      // Wait a bit before starting call
      setTimeout(() => {
        startCall()
          .then(() => {
            console.log('✅ Call started successfully');
            setCallStatus('connected');
          })
          .catch((err) => {
            console.error('❌ Call start failed:', err);
            console.error('Make sure backend is running on http://localhost:3001');
            setCallStatus('ended');
          });
      }, 500); // 500ms delay
    }
  }, [startCall]);

  // Call duration timer
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle end call
  const handleEndCall = () => {
    console.log('📞 Ending call...');
    endCall();
    setCallStatus('ended');
    onEndCall();
  };

  // Handle toggle video
  const handleToggleVideo = () => {
    if (callType === 'video') {
      setIsVideoEnabled((prev) => !prev);
    }
  };

  // Handle toggle audio
  const handleToggleAudio = () => {
    setIsAudioMuted((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">AI Voice Call</h2>
            <p className="text-slate-400 text-sm">
              Model: {aiModel} • {formatDuration(callDuration)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {error && (
              <div className="text-red-300 text-sm bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">
                <div className="font-semibold">Connection Error:</div>
                <div className="text-xs mt-1">{error}</div>
                <div className="text-xs mt-1 text-red-200">
                  Make sure backend is running: <code className="bg-red-900/30 px-1 rounded">npm run dev</code> in ai_chatbot_be
                </div>
              </div>
            )}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          <div className={`grid ${showTranscript ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {/* Video/Audio Area */}
            <div className={showTranscript ? 'lg:col-span-2' : 'col-span-1'}>
              <CallVideoArea
                callType={callType}
                callStatus={callStatus}
                isVideoEnabled={isVideoEnabled}
                isFullscreen={isFullscreen}
                callDuration={callDuration}
                formatDuration={formatDuration}
                setIsFullscreen={setIsFullscreen}
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
              />
            </div>

            {/* Transcript Sidebar */}
            {showTranscript && (
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
                              message.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {/* AI Avatar */}
                            {message.type === 'ai' && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg break-words ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-white border border-slate-700'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              <p
                                className={`text-xs mt-1 text-right ${
                                  message.type === 'user' ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>

                            {/* User Avatar */}
                            {message.type === 'user' && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        <CallControls
          callType={callType}
          isVideoEnabled={isVideoEnabled}
          isAudioMuted={isAudioMuted}
          onToggleVideo={handleToggleVideo}
          onToggleAudio={handleToggleAudio}
          onEndCall={handleEndCall}
        />

        {/* Status Message */}
        <div className="max-w-7xl mx-auto px-6 pb-4 text-center">
          <p className="text-slate-400 text-sm">
            {isListening
              ? '🎤 Listening to your voice...'
              : isThinking
              ? '🧠 SumNex is thinking...'
              : isSpeaking
              ? '🤖 SumNex is speaking...'
              : '💬 Speak naturally - SumNex will respond after 2 seconds of silence'}
          </p>
        </div>
      </div>
    </div>
  );
};