import { CallStatus, CallType } from '@/app/call.types';
import { Typography } from '@/components/custom/Typography';
import { Bot, Maximize2, Minimize2, Phone } from 'lucide-react';
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

  // Voice states from useAICall
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

export const CallVideoArea: React.FC<CallVideoAreaProps> = ({
  callType,
  callStatus,
  isVideoEnabled,
  isFullscreen,
  callDuration,
  formatDuration,
  setIsFullscreen,
  isListening,
  isSpeaking,
  isThinking,
}) => {
  // Determine AI status for display
  const getAIStatus = () => {
    if (isListening) return { text: 'Listening...', color: 'from-red-500 to-pink-500' };
    if (isThinking) return { text: 'Thinking...', color: 'from-yellow-500 to-orange-500' };
    if (isSpeaking) return { text: 'Speaking...', color: 'from-blue-500 to-cyan-500' };
    return { text: 'Ready', color: 'from-green-500 to-emerald-500' };
  };

  const aiStatus = getAIStatus();

  return (
    <div
      className={`relative ${
        isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'
      } bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden`}
    >
      {callType === 'video' && isVideoEnabled ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            {/* Animated AI Avatar with Status */}
            <div 
              className={`w-32 h-32 bg-gradient-to-br ${aiStatus.color} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg transition-all duration-300 ${
                isListening || isSpeaking || isThinking ? 'animate-pulse scale-110' : 'scale-100'
              }`}
            >
              <Bot className="w-16 h-16 text-white" />
            </div>
            
            <Typography variant="h3" className="text-white mb-2">
              SumNex AI
            </Typography>
            
            {/* Status Text */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${aiStatus.color} animate-pulse`} />
              <Typography variant="small" className="text-slate-300">
                {aiStatus.text}
              </Typography>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            {/* Voice Call Avatar with Status */}
            <div 
              className={`w-32 h-32 bg-gradient-to-br ${aiStatus.color} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg transition-all duration-300 ${
                isListening || isSpeaking || isThinking ? 'animate-pulse scale-110' : 'scale-100'
              }`}
            >
              <Phone className="w-16 h-16 text-white" />
            </div>
            
            <Typography variant="h3" className="text-white mb-2">
              SumNex AI
            </Typography>
            
            {/* Status Text */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${aiStatus.color} animate-pulse`} />
              <Typography variant="small" className="text-slate-300">
                {callStatus === 'ringing' ? 'Connecting...' : aiStatus.text}
              </Typography>
            </div>
          </div>
        </div>
      )}

      {/* Call Status Overlay - Top Bar */}
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
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-white" />
          ) : (
            <Maximize2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Voice Status Indicator - Bottom Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            {isListening && (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">🎤 Listening to you...</span>
              </>
            )}
            {isThinking && (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">🧠 Thinking...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">🤖 SumNex is speaking...</span>
              </>
            )}
            {!isListening && !isThinking && !isSpeaking && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">💬 Ready - Speak naturally</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Self Video Preview - Only for video calls */}
      {callType === 'video' && isVideoEnabled && (
        <SelfVideoPreview
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
        />
      )}
    </div>
  );
};