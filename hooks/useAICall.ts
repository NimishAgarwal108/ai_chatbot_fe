// ============================================
// File: hooks/useAICall.ts
// React Hook for AI Calls with Voice Activity Detection
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
  isThinking: boolean; // ✨ NEW: Track when AI is processing
  messages: Message[];
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  sendMessage: (text: string) => Promise<void>;
}

export function useAICall(callConfig: AICallConfig): UseAICallReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // ✨ NEW
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

      if (volume > VOICE_THRESHOLD && !isSpeaking && !isThinking) {
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
  }, [getAudioVolume, isSpeaking, isThinking]);

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
    if (isRecordingRef.current || isSpeaking || isThinking) return;

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
  }, [isSpeaking, isThinking]);

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
            voiceService.speakText(greeting);
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
          cleaned === "SumNex platform" ||
          cleaned === "platform" ||
          cleaned === "SumNex"
        ) {
          console.warn("🧠 Ignored hallucinated transcription");
          return;
        }

        addUserMessage(text);
        // ✨ After user speaks, AI starts thinking
        setIsThinking(true);
      });

      voiceService.onResponse((text) => {
        console.log("🤖 AI Response:", text);
        addAIMessage(text);
        // ✨ AI done thinking, now speaking
        setIsThinking(false);
        setIsSpeaking(false);
      });

      voiceService.onAudio(async (audioData) => {
        console.log("🔊 Audio received");
        try {
          await voiceService.playAudio(audioData);
        } catch (err) {
          console.error("Error playing audio:", err);
        }
      });

      voiceService.onStatus((status, message) => {
        console.log(`📊 Status: ${status} - ${message}`);
        if (status === "processing") {
          // ✨ AI is processing = thinking
          setIsThinking(true);
          setIsSpeaking(false);
        } else if (status === "speaking") {
          // ✨ AI is speaking
          setIsThinking(false);
          setIsSpeaking(true);
        } else if (status === "complete") {
          // ✨ AI finished
          setIsThinking(false);
          setIsSpeaking(false);
        }
      });

      voiceService.onError((msg) => {
        console.error("❌ Voice service error:", msg);
        setError(msg);
        setIsThinking(false);
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
          // ✨ Start thinking when audio is sent
          setIsThinking(true);
          const voice = callConfig.voiceSettings?.voice || "nova";
          await voiceServiceRef.current.sendAudio(audioBlob, voice);
        } catch (err) {
          lastErrorTimeRef.current = Date.now();
          console.error("❌ Audio send failed", err);
          setIsThinking(false);
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

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (voiceServiceRef.current) {
      voiceServiceRef.current.disconnect();
      voiceServiceRef.current = null;
    }

    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false); // ✨ Reset thinking state
    isRecordingRef.current = false;
    isInitializedRef.current = false;
    hasGreetedRef.current = false;

    console.log("📞 AI call ended");
  }, [stopVAD]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // ✨ Start thinking when message is sent
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
    isThinking, // ✨ Export new state
    messages,
    error,
    startCall,
    endCall,
    sendMessage,
  };
}