// ============================================
// File: hooks/useAICall.ts
// React Hook for AI Calls with Voice Activity Detection
// FIXED VERSION - Natural conversation flow
// ============================================

import { AIVoiceService, createVoiceService } from "@/lib/aiVoiceService";
import { authService } from "@/lib/authService";
import { useCallback, useEffect, useRef, useState } from "react";

interface AICallConfig {
  callId: string;
  userId: string;
  callType: "voice" | "video";
  aiModel?: string;
  language?: string;
  voiceSettings?: {
    voice: string;
    speed: number;
  };
}

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  audioUrl?: string;
  timestamp: Date;
}

interface UseAICallReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  messages: Message[];
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  sendMessage: (text: string) => Promise<void>;
}

export function useAICall(callConfig: AICallConfig): UseAICallReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const voiceServiceRef = useRef<AIVoiceService | null>(null);

  // VAD (Voice Activity Detection) refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const lastVoiceTimeRef = useRef<number>(0);
  const hasGreetedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);
  const voiceDetectedRef = useRef(false);
  const firstVoiceDetectedRef = useRef(0); // Track when voice first detected
  
  // FIXED: Better constants for natural conversation
  const MIN_AUDIO_SIZE = 8000; // Minimum audio size to process
  const PROCESS_COOLDOWN = 3000; // 3 seconds between processing
  const MAX_CONSECUTIVE_ERRORS = 3;
  const ERROR_RESET_TIME = 30000;

  // FIXED: Optimized VAD constants for natural conversation
  const SILENCE_THRESHOLD = 2000; // 2 seconds after user stops speaking
  const VOICE_THRESHOLD = -42; // Voice detection threshold
  const MIN_VOICE_DURATION = 800; // Minimum 800ms of continuous speech
  const CHECK_INTERVAL = 150; // Check every 150ms (reduced frequency)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

  // Check browser support
  const isBrowserSupported = () => {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window.MediaRecorder === "function"
    );
  };

  // Add user message helper
  const addUserMessage = useCallback((text: string) => {
    const message: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Add AI message helper
  const addAIMessage = useCallback((text: string, audioUrl?: string) => {
    const message: Message = {
      id: `ai-${Date.now()}-${Math.random()}`,
      type: "ai",
      text,
      audioUrl,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      console.log("⏰ Call ended due to 10 minutes of inactivity");
      setError("Call ended due to inactivity");
    }, INACTIVITY_TIMEOUT);
  }, []);

  // Reset error counter
  const resetErrorCounter = useCallback(() => {
    if (consecutiveErrorsRef.current > 0) {
      console.log('✅ Resetting error counter');
      consecutiveErrorsRef.current = 0;
      setError(null);
    }
  }, []);

  // Auto-reset errors after timeout
  useEffect(() => {
    const checkErrorTimeout = setInterval(() => {
      const now = Date.now();
      if (
        consecutiveErrorsRef.current > 0 && 
        now - lastProcessTimeRef.current > ERROR_RESET_TIME
      ) {
        console.log('⏱️ Auto-resetting error counter due to timeout');
        resetErrorCounter();
      }
    }, 5000);

    return () => clearInterval(checkErrorTimeout);
  }, [resetErrorCounter]);

  // Calculate audio volume (for VAD)
  const getAudioVolume = useCallback((): number => {
    if (!analyserRef.current) return -100;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;

    return 20 * Math.log10(average / 255);
  }, []);

  // FIXED: Stop recording and process - only if valid voice detected
  const stopRecordingAndProcess = useCallback(() => {
    if (!isRecordingRef.current) return;

    const now = Date.now();
    
    // Check cooldown period
    if (now - lastProcessTimeRef.current < PROCESS_COOLDOWN) {
      console.log(`⏳ Cooldown active (${Math.round((now - lastProcessTimeRef.current) / 1000)}s / ${PROCESS_COOLDOWN / 1000}s)`);
      isRecordingRef.current = false;
      voiceDetectedRef.current = false;
      firstVoiceDetectedRef.current = 0;
      audioChunksRef.current = [];
      setIsListening(false);
      
      // Stop recorder without processing
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error("Error stopping recording:", err);
        }
      }
      return;
    }
    
    // Check if voice was detected for minimum duration
    const voiceDuration = now - firstVoiceDetectedRef.current;
    if (!voiceDetectedRef.current || voiceDuration < MIN_VOICE_DURATION) {
      console.log(`⏭️ Skipping - insufficient voice (${voiceDuration}ms < ${MIN_VOICE_DURATION}ms)`);
      isRecordingRef.current = false;
      voiceDetectedRef.current = false;
      firstVoiceDetectedRef.current = 0;
      audioChunksRef.current = [];
      setIsListening(false);
      
      // Stop recorder without processing
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error("Error stopping recording:", err);
        }
      }
      return;
    }

    console.log(`✅ Valid speech detected (${voiceDuration}ms) - processing...`);
    lastProcessTimeRef.current = now;
    isRecordingRef.current = false;
    voiceDetectedRef.current = false;
    firstVoiceDetectedRef.current = 0;
    setIsListening(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
        console.log("🛑 Recording stopped - will process audio");
      } catch (err) {
        console.error("Error stopping recording:", err);
        audioChunksRef.current = [];
      }
    }
  }, []);

  // FIXED: Start recording only when needed
  const startRecordingChunk = useCallback(async () => {
    // Don't start if already recording or AI is busy
    if (isRecordingRef.current || isSpeaking || isThinking) {
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastProcessTimeRef.current < PROCESS_COOLDOWN) {
      return;
    }

    // Check error count
    if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
      return;
    }

    try {
      console.log("🎤 Starting new recording session");
      isRecordingRef.current = true;
      voiceDetectedRef.current = false;
      firstVoiceDetectedRef.current = 0;
      setIsListening(true);
      audioChunksRef.current = [];

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "inactive"
      ) {
        mediaRecorderRef.current.start();
        console.log("▶️ MediaRecorder started");
      }
    } catch (err) {
      console.error("Error starting recording chunk:", err);
      isRecordingRef.current = false;
      voiceDetectedRef.current = false;
      firstVoiceDetectedRef.current = 0;
      setIsListening(false);
    }
  }, [isSpeaking, isThinking]);

  // FIXED: Improved Voice Activity Detection
  const startVAD = useCallback(() => {
    if (vadIntervalRef.current) return;

    console.log("🎤 Starting Voice Activity Detection");

    vadIntervalRef.current = setInterval(() => {
      // Skip if AI is speaking or thinking
      if (isSpeaking || isThinking) {
        return;
      }

      const volume = getAudioVolume();
      const now = Date.now();

      if (volume > VOICE_THRESHOLD) {
        // Voice detected
        lastVoiceTimeRef.current = now;
        
        if (!isRecordingRef.current) {
          // Start new recording session
          startRecordingChunk();
        } else if (!voiceDetectedRef.current) {
          // Mark that we detected actual voice
          console.log(`🎙️ Voice confirmed (${volume.toFixed(1)} dB)`);
          voiceDetectedRef.current = true;
          firstVoiceDetectedRef.current = now;
        }
      } else if (isRecordingRef.current && voiceDetectedRef.current) {
        // Check silence duration
        const silence = now - lastVoiceTimeRef.current;

        if (silence > SILENCE_THRESHOLD) {
          console.log(`🤫 ${silence}ms silence - stopping recording`);
          stopRecordingAndProcess();
        }
      }
    }, CHECK_INTERVAL);
  }, [getAudioVolume, isSpeaking, isThinking, startRecordingChunk, stopRecordingAndProcess]);

  // Stop VAD
  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Initialize voice service
  const initVoiceService = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }

      console.log('🔧 Initializing voice service...');
      const voiceService = createVoiceService(token);
      voiceServiceRef.current = voiceService;

      // Set up event listeners
      voiceService.onConnected(() => {
        console.log("✅ Voice service connected");
        resetErrorCounter();

        if (!hasGreetedRef.current) {
          hasGreetedRef.current = true;
          const greeting = "Hello! I'm SumNex. How can I help you today?";

          setTimeout(() => {
            addAIMessage(greeting);
            setIsSpeaking(true);
            voiceService.speakText(greeting).then(() => {
              console.log('✅ Greeting complete - ready for user');
              setIsSpeaking(false);
            }).catch(() => {
              setIsSpeaking(false);
            });
          }, 500);

          setTimeout(() => {
            resetInactivityTimer();
          }, 3000);
        }
      });

      voiceService.onTranscription((text) => {
        console.log('📥 Transcription:', text);
        
        if (!text || text.trim().length < 2) {
          console.log('⏭️ Skipping empty/short transcription');
          return;
        }

        const cleaned = text.toLowerCase().trim();

        // Filter hallucinations
        const hallucinations = ['sumnex', 'platform', 'thank you', 'thanks'];
        if (hallucinations.some(h => cleaned === h || cleaned === `${h}.`)) {
          console.warn("🧠 Ignored hallucination:", text);
          return;
        }

        console.log('✅ Valid transcription:', text);
        addUserMessage(text);
        resetInactivityTimer();
        resetErrorCounter();
      });

      voiceService.onResponse((text) => {
        console.log('🤖 AI response:', text);
        addAIMessage(text);
        setIsThinking(false);
        setIsSpeaking(true);
        
        voiceService.speakText(text).then(() => {
          console.log('✅ Response complete - ready for user');
          setIsSpeaking(false);
        }).catch((err) => {
          console.error('❌ Speech error:', err);
          setIsSpeaking(false);
        });
        
        resetErrorCounter();
      });

      voiceService.onStatus((status, message) => {
        console.log(`📊 ${status}: ${message}`);
        
        if (status === "processing") {
          setIsThinking(true);
          setIsSpeaking(false);
          setIsListening(false);
        } else if (status === "speaking") {
          setIsThinking(false);
          setIsSpeaking(true);
          setIsListening(false);
        } else if (status === "complete") {
          setIsThinking(false);
          setIsSpeaking(false);
          setIsListening(false);
        }
      });

      voiceService.onError((msg) => {
        console.error("❌ Error:", msg);
        
        consecutiveErrorsRef.current++;
        console.log(`Error: ${consecutiveErrorsRef.current}/${MAX_CONSECUTIVE_ERRORS}`);
        
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          setError(`Voice recognition failed. Please check microphone and internet. Error: ${msg}`);
        }
        
        setIsThinking(false);
        setIsSpeaking(false);
        setIsListening(false);
        isRecordingRef.current = false;
        voiceDetectedRef.current = false;
        audioChunksRef.current = [];
      });

      await voiceService.connect();
      console.log('✅ Voice service ready');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize";
      setError(errorMessage);
      console.error("Initialization error:", err);
      throw err;
    }
  }, [resetInactivityTimer, addUserMessage, addAIMessage, resetErrorCounter]);

  // Initialize audio stream
  const initAudioStream = useCallback(async () => {
    try {
      console.log('🎧 Requesting microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      console.log('✅ Microphone granted');
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const alternatives = ['audio/webm', 'audio/ogg;codecs=opus'];
        mimeType = alternatives.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
        console.log('📝 Using:', mimeType);
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 16000
      });

      // FIXED: Only collect data when recording
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && isRecordingRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('⏸️ Recorder stopped');
        
        if (!voiceServiceRef.current || audioChunksRef.current.length === 0) {
          console.log('⏭️ No audio to process');
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const blobSize = audioBlob.size;
        audioChunksRef.current = [];

        console.log(`📦 Audio: ${blobSize} bytes (min: ${MIN_AUDIO_SIZE})`);

        if (blobSize < MIN_AUDIO_SIZE) {
          console.warn(`⏭️ Too small, skipped`);
          return;
        }

        try {
          console.log('📤 Sending to backend...');
          setIsThinking(true);
          setIsListening(false);
          
          const voice = callConfig.voiceSettings?.voice || "nova";
          await voiceServiceRef.current.sendAudio(audioBlob, voice);
          console.log("✅ Sent successfully");
          
        } catch (err) {
          consecutiveErrorsRef.current++;
          console.error("❌ Send failed:", err);
          
          setIsThinking(false);
          setIsSpeaking(false);
          setIsListening(false);
          
          if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
            setError("Failed to send audio. Please check connection.");
          }
        }
      };

      mediaRecorderRef.current.onerror = (event: any) => {
        console.error('❌ Recorder error:', event);
        audioChunksRef.current = [];
      };

      startVAD();
      console.log("✅ Audio system ready");
      
    } catch (err) {
      console.error("Microphone error:", err);
      throw new Error("Microphone access denied");
    }
  }, [startVAD, callConfig]);

  // Start call
  const startCall = useCallback(async () => {
    if (isInitializedRef.current) {
      console.warn("⚠️ Already initialized");
      return;
    }

    try {
      setError(null);
      consecutiveErrorsRef.current = 0;

      if (!isBrowserSupported()) {
        throw new Error("Browser not supported");
      }

      isInitializedRef.current = true;
      console.log("🚀 Starting call");

      await initVoiceService();
      await initAudioStream();
      
    } catch (err) {
      isInitializedRef.current = false;
      const msg = err instanceof Error ? err.message : "Failed to start";
      setError(msg);
      console.error(err);
    }
  }, [initVoiceService, initAudioStream]);

  // End call
  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    
    stopVAD();

    if (mediaRecorderRef.current?.state !== "inactive") {
      try {
        mediaRecorderRef.current?.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    voiceServiceRef.current?.disconnect();

    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    isRecordingRef.current = false;
    voiceDetectedRef.current = false;
    isInitializedRef.current = false;
    hasGreetedRef.current = false;
    consecutiveErrorsRef.current = 0;
    audioChunksRef.current = [];

    console.log("✅ Call ended");
  }, [stopVAD]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsThinking(true);

      try {
        addUserMessage(text);
        resetInactivityTimer();

        if (voiceServiceRef.current) {
          const voice = callConfig.voiceSettings?.voice || "nova";
          await voiceServiceRef.current.sendText(text, voice);
          resetErrorCounter();
        } else {
          throw new Error("Not initialized");
        }
      } catch (err) {
        consecutiveErrorsRef.current++;
        setError(err instanceof Error ? err.message : "Failed");
        console.error(err);
        setIsThinking(false);
        setIsSpeaking(false);
      }
    },
    [callConfig, addUserMessage, resetInactivityTimer, resetErrorCounter]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    isListening,
    isSpeaking,
    isThinking,
    messages,
    error,
    startCall,
    endCall,
    sendMessage,
  };
}