// ============================================
// File: hooks/useAICall.ts
// FIXED: React Hook for AI Calls with Voice Activity Detection
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
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const lastVoiceTimeRef = useRef<number>(0);
  const hasGreetedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const MIN_AUDIO_SIZE = 4000;
  const PROCESS_COOLDOWN = 1500;

  // ✨ FIX: Add ref to track if AI is currently speaking
  const aiSpeakingRef = useRef(false);

  // Constants for VAD
  const SILENCE_THRESHOLD = 2000;
  const VOICE_THRESHOLD = -50;
  const CHECK_INTERVAL = 100;
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
  const addUserMessage = (text: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    resetInactivityTimer();
  };

  // Add AI message helper
  const addAIMessage = (text: string, audioUrl?: string) => {
    const message: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      text,
      audioUrl,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      console.log("⏰ Call ended due to 10 minutes of inactivity");
      setError("Call ended due to inactivity");
      endCall();
    }, INACTIVITY_TIMEOUT);
  }, []);

  // Calculate audio volume (for VAD)
  const getAudioVolume = useCallback((): number => {
    if (!analyserRef.current) return -100;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;

    return 20 * Math.log10(average / 255);
  }, []);

  // Start Voice Activity Detection
  const startVAD = useCallback(() => {
    if (vadIntervalRef.current) return;

    console.log("🎤 Starting Voice Activity Detection");

    vadIntervalRef.current = setInterval(() => {
      const volume = getAudioVolume();
      const now = Date.now();

      // ✨ FIX: Check aiSpeakingRef instead of isSpeaking state
      if (volume > VOICE_THRESHOLD && !aiSpeakingRef.current && !isThinking) {
        lastVoiceTimeRef.current = now;

        if (!isRecordingRef.current) {
          startRecordingChunk();
        }
      } else if (isRecordingRef.current) {
        const silence = now - lastVoiceTimeRef.current;

        if (silence > SILENCE_THRESHOLD) {
          stopRecordingAndProcess();
        }
      }
    }, CHECK_INTERVAL);
  }, [getAudioVolume, isThinking]);

  // Stop VAD
  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Start recording a chunk
  const startRecordingChunk = useCallback(async () => {
    // ✨ FIX: Check aiSpeakingRef instead of state
    if (isRecordingRef.current || aiSpeakingRef.current || isThinking) return;

    try {
      isRecordingRef.current = true;
      setIsListening(true);
      audioChunksRef.current = [];

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "inactive"
      ) {
        mediaRecorderRef.current.start();
        console.log("🎤 Started recording chunk");
      }
    } catch (err) {
      console.error("Error starting recording chunk:", err);
      isRecordingRef.current = false;
      setIsListening(false);
    }
  }, [isThinking]);

  // Stop recording and process
  const stopRecordingAndProcess = useCallback(() => {
    if (!isRecordingRef.current) return;

    const now = Date.now();

    if (now - lastProcessTimeRef.current < PROCESS_COOLDOWN) {
      return;
    }

    lastProcessTimeRef.current = now;
    isRecordingRef.current = false;
    setIsListening(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      console.log("🛑 Recording stopped");
    }
  }, []);

  // Initialize voice service
  const initVoiceService = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }

      const voiceService = createVoiceService(token);
      voiceServiceRef.current = voiceService;

      // Set up event listeners
      voiceService.onConnected(() => {
        console.log("✅ Voice service connected");

        if (!hasGreetedRef.current) {
          hasGreetedRef.current = true;
          const greeting = "Hello! I'm SumNex. How can I help you today?";

          setTimeout(() => {
            addAIMessage(greeting);
            // ✨ FIX: Set speaking ref before speaking
            aiSpeakingRef.current = true;
            setIsSpeaking(true);
            
            voiceService.speakText(greeting).finally(() => {
              // ✨ FIX: Clear speaking state after done
              aiSpeakingRef.current = false;
              setIsSpeaking(false);
            });
          }, 500);

          setTimeout(() => {
            resetInactivityTimer();
          }, 2000);
        }
      });

      voiceService.onTranscription((text) => {
        if (!text || text.length < 3) return;

        const cleaned = text.toLowerCase().trim();

        if (
          cleaned === "sumnex platform" ||
          cleaned === "platform" ||
          cleaned === "sumnex"
        ) {
          console.warn("🧠 Ignored hallucinated transcription");
          return;
        }

        addUserMessage(text);
        // User spoke, AI starts thinking
        setIsThinking(true);
      });

      voiceService.onResponse((text) => {
        console.log("🤖 AI Response:", text);
        addAIMessage(text);
        // AI done thinking, now ready to speak
        setIsThinking(false);
        // Don't set isSpeaking here - wait for actual speech to start
      });

      voiceService.onAudio(async (audioData) => {
        console.log("🔊 Audio received");
        try {
          // ✨ FIX: Set speaking state before playing
          aiSpeakingRef.current = true;
          setIsSpeaking(true);
          
          await voiceService.playAudio(audioData);
          
          // ✨ FIX: Clear speaking state after done
          aiSpeakingRef.current = false;
          setIsSpeaking(false);
        } catch (err) {
          console.error("Error playing audio:", err);
          aiSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      });

      voiceService.onStatus((status, message) => {
        console.log(`📊 Status: ${status} - ${message}`);
        if (status === "processing") {
          setIsThinking(true);
          aiSpeakingRef.current = false;
          setIsSpeaking(false);
        } else if (status === "speaking") {
          setIsThinking(false);
          aiSpeakingRef.current = true;
          setIsSpeaking(true);
        } else if (status === "complete") {
          setIsThinking(false);
          aiSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      });

      voiceService.onError((msg) => {
        console.error("❌ Voice service error:", msg);
        setError(msg);
        setIsThinking(false);
        aiSpeakingRef.current = false;
        setIsSpeaking(false);
        lastErrorTimeRef.current = Date.now();
      });

      await voiceService.connect();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize voice service";
      setError(errorMessage);
      console.error("Error initializing voice service:", err);
      throw err;
    }
  }, [resetInactivityTimer]);

  // Initialize audio stream with VAD
  const initAudioStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      
      // ✨ FIX: Proper AudioContext creation and cleanup
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (!voiceServiceRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        audioChunksRef.current = [];

        if (audioBlob.size < MIN_AUDIO_SIZE) {
          console.warn("🎧 Audio too short, skipped");
          return;
        }

        try {
          setIsThinking(true);
          const voice = callConfig.voiceSettings?.voice || "nova";
          await voiceServiceRef.current.sendAudio(audioBlob, voice);
        } catch (err) {
          lastErrorTimeRef.current = Date.now();
          console.error("❌ Audio send failed", err);
          setIsThinking(false);
          aiSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      };

      startVAD();

      console.log("✅ Audio stream and VAD initialized");
    } catch (err) {
      console.error("Error initializing audio stream:", err);
      throw new Error("Failed to access microphone");
    }
  }, [startVAD, callConfig]);

  // Start call
  const startCall = useCallback(async () => {
    if (isInitializedRef.current) {
      console.warn("⚠️ Call already initialized");
      return;
    }

    try {
      setError(null);

      if (!isBrowserSupported()) {
        throw new Error("Browser does not support audio recording");
      }

      isInitializedRef.current = true;
      console.log("🚀 Starting AI call");

      await initVoiceService();
      await initAudioStream();
    } catch (err) {
      isInitializedRef.current = false;
      const msg = err instanceof Error ? err.message : "Failed to start call";
      setError(msg);
      console.error(err);
    }
  }, [initVoiceService, initAudioStream]);

  // End call
  const endCall = useCallback(() => {
    stopVAD();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // ✨ FIX: Properly close AudioContext with state check
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) => {
          console.warn("AudioContext close warning:", err);
        });
      }
      audioContextRef.current = null;
    }

    if (voiceServiceRef.current) {
      voiceServiceRef.current.disconnect();
      voiceServiceRef.current = null;
    }

    setIsListening(false);
    aiSpeakingRef.current = false;
    setIsSpeaking(false);
    setIsThinking(false);
    isRecordingRef.current = false;
    isInitializedRef.current = false;
    hasGreetedRef.current = false;

    console.log("📞 AI call ended");
  }, [stopVAD]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsThinking(true);

      try {
        addUserMessage(text);

        if (voiceServiceRef.current) {
          const voice = callConfig.voiceSettings?.voice || "nova";
          await voiceServiceRef.current.sendText(text, voice);
        } else {
          throw new Error("Voice service not initialized");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Error sending message:", err);
        setIsThinking(false);
        aiSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    },
    [callConfig]
  );

  // Cleanup on unmount
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