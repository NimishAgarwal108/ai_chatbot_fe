// ============================================
// File: hooks/useAICall.ts
// React Hook for AI Calls - Connected to Backend
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { AIVoiceService, createVoiceService } from '@/lib/aiVoiceService';
import { authService } from '@/lib/authService';

interface AICallConfig {
  callId: string;
  userId: string;
  callType: 'voice' | 'video';
  aiModel?: string;
  language?: string;
  voiceSettings?: {
    voice: string;
    speed: number;
  };
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  audioUrl?: string;
  timestamp: Date;
}

interface UseAICallReturn {
  isRecording: boolean;
  isProcessing: boolean;
  messages: Message[];
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  sendMessage: (text: string) => Promise<void>;
  toggleRecording: () => Promise<void>;
}

export function useAICall(callConfig: AICallConfig): UseAICallReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const voiceServiceRef = useRef<AIVoiceService | null>(null);

  // Check browser support
  const isBrowserSupported = () => {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder === 'function'
    );
  };

  // Add user message helper
  const addUserMessage = (text: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
  };

  // Add AI message helper
  const addAIMessage = (text: string, audioUrl?: string) => {
    const message: Message = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      text,
      audioUrl,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
  };

  // Initialize voice service
  const initVoiceService = useCallback(async () => {
    try {
      // Get auth token
      const token = authService.getToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Create voice service
      const voiceService = createVoiceService(token);
      voiceServiceRef.current = voiceService;

      // Set up event listeners
      voiceService.onConnected(() => {
        console.log('✅ Voice service connected');
        addAIMessage('Hello! I\'m your AI assistant. How can I help you today?');
      });

      voiceService.onTranscription((text) => {
        console.log('📝 Transcription:', text);
        addUserMessage(text);
      });

      voiceService.onResponse((text) => {
        console.log('🤖 AI Response:', text);
        addAIMessage(text);
      });

      voiceService.onAudio(async (audioData) => {
        console.log('🔊 Audio received');
        try {
          await voiceService.playAudio(audioData);
        } catch (err) {
          console.error('Error playing audio:', err);
        }
      });

      voiceService.onStatus((status, message) => {
        console.log(`📊 Status: ${status} - ${message}`);
        if (status === 'processing') {
          setIsProcessing(true);
        } else if (status === 'complete') {
          setIsProcessing(false);
        }
      });

      voiceService.onError((errorMsg) => {
        console.error('❌ Voice service error:', errorMsg);
        setError(errorMsg);
        setIsProcessing(false);
      });

      // Connect to backend
      await voiceService.connect();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize voice service';
      setError(errorMessage);
      console.error('Error initializing voice service:', err);
      throw err;
    }
  }, []);

  // Start call - Initialize
  const startCall = useCallback(async () => {
    try {
      setError(null);
      
      if (!isBrowserSupported()) {
        throw new Error('Your browser does not support audio recording');
      }

      console.log('🚀 Starting AI call...');
      
      // Initialize voice service and connect to backend
      await initVoiceService();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      console.error('Error starting call:', err);
    }
  }, [initVoiceService]);

  // End call - Cleanup
  const endCall = useCallback(() => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect voice service
    if (voiceServiceRef.current) {
      voiceServiceRef.current.disconnect();
      voiceServiceRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(false);
    console.log('📞 AI call ended');
  }, []);

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      
      console.log('🎤 Recording started');
    } catch (err) {
      console.error('Error starting recording:', err);
      throw new Error('Failed to access microphone');
    }
  };

  // Stop recording and get audio blob
  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No recorder available'));
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        audioChunksRef.current = [];
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop and process
      setIsProcessing(true);
      
      try {
        const audioBlob = await stopRecording();
        
        // Send audio to backend
        if (voiceServiceRef.current) {
          const voice = callConfig.voiceSettings?.voice || 'nova';
          await voiceServiceRef.current.sendAudio(audioBlob, voice);
        } else {
          throw new Error('Voice service not initialized');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
        setError(errorMessage);
        console.error('Error processing audio:', err);
        setIsProcessing(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
        setError(errorMessage);
        console.error('Error starting recording:', err);
      }
    }
  }, [isRecording, callConfig]);

  // Send text message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message
      addUserMessage(text);
      
      // Send text to backend
      if (voiceServiceRef.current) {
        const voice = callConfig.voiceSettings?.voice || 'nova';
        await voiceServiceRef.current.sendText(text, voice);
      } else {
        throw new Error('Voice service not initialized');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      setIsProcessing(false);
    }
  }, [callConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    isRecording,
    isProcessing,
    messages,
    error,
    startCall,
    endCall,
    sendMessage,
    toggleRecording,
  };
}