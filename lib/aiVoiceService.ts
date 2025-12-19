// ============================================
// File: lib/aiVoiceService.ts
// Frontend Voice Service - 100% FREE Version
// ============================================

import { io, Socket } from 'socket.io-client';

interface VoiceServiceConfig {
  backendUrl?: string;
  token: string;
}

interface VoiceMessage {
  type: 'audio' | 'text' | 'control';
  data: string | Buffer;
  timestamp: number;
  voice?: string;
}

interface VoiceResponse {
  type: 'transcription' | 'response' | 'audio' | 'status' | 'error';
  text?: string;
  data?: string;
  status?: string;
  message?: string;
  error?: string;
  timestamp: number;
}

export class AIVoiceService {
  private socket: Socket | null = null;
  private backendUrl: string;
  private token: string;
  private isConnected: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  
  // Event handlers
  private onTranscriptionCallback?: (text: string) => void;
  private onResponseCallback?: (text: string) => void;
  private onAudioCallback?: (audioData: string) => void;
  private onStatusCallback?: (status: string, message: string) => void;
  private onErrorCallback?: (error: string) => void;
  private onConnectedCallback?: () => void;

  constructor(config: VoiceServiceConfig) {
    this.backendUrl = config.backendUrl || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    this.token = config.token;
    this.initializeBrowserTTS();
  }

  // Initialize browser's Text-to-Speech (FREE!)
  private initializeBrowserTTS(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load available voices
      const loadVoices = () => {
        this.availableVoices = speechSynthesis.getVoices();
        console.log(`✅ Loaded ${this.availableVoices.length} TTS voices`);
      };

      loadVoices();
      
      // Voices might load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('⚠️ Browser Text-to-Speech not supported');
    }
  }

  // Connect to backend WebSocket
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.backendUrl, {
          auth: {
            token: this.token,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        // Connection established
        this.socket.on('voice:connected', (data: any) => {
          console.log('✅ Connected to voice service:', data);
          this.isConnected = true;
          this.onConnectedCallback?.();
          resolve();
        });

        // Transcription received (user's speech)
        this.socket.on('voice:text', (data: VoiceResponse) => {
          if (data.type === 'transcription' && data.text) {
            this.onTranscriptionCallback?.(data.text);
          } else if (data.type === 'response' && data.text) {
            // When we get a text response, automatically speak it using browser TTS
            this.onResponseCallback?.(data.text);
            this.speakText(data.text);
          }
        });

        // Audio response received (for backward compatibility)
        this.socket.on('voice:audio', (data: VoiceResponse) => {
          // Since we're using browser TTS, this won't be used
          // but kept for backward compatibility
          if (data.data) {
            this.onAudioCallback?.(data.data);
          }
        });

        // Status updates
        this.socket.on('voice:status', (data: VoiceResponse) => {
          if (data.status && data.message) {
            this.onStatusCallback?.(data.status, data.message);
          }
        });

        // Errors
        this.socket.on('voice:error', (data: VoiceResponse) => {
          if (data.error) {
            this.onErrorCallback?.(data.error);
          }
        });

        // Connection error
        this.socket.on('connect_error', (error: Error) => {
          console.error('❌ Connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnected
        this.socket.on('disconnect', () => {
          console.log('📡 Disconnected from voice service');
          this.isConnected = false;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Send audio to backend for processing
  async sendAudio(audioBlob: Blob, voice: string = 'default'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to voice service');
    }

    // Convert blob to base64
    const base64Audio = await this.blobToBase64(audioBlob);

    const message: VoiceMessage = {
      type: 'audio',
      data: base64Audio,
      timestamp: Date.now(),
      voice,
    };

    this.socket.emit('voice:audio', message);
  }

  // Send text to backend for AI response
  async sendText(text: string, voice: string = 'default'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to voice service');
    }

    const message: VoiceMessage = {
      type: 'text',
      data: text,
      timestamp: Date.now(),
      voice,
    };

    this.socket.emit('voice:text', message);
  }

  // Send control messages (start, stop, mute, etc.)
  sendControl(action: 'start' | 'stop' | 'mute' | 'unmute'): void {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to voice service');
    }

    const message: VoiceMessage = {
      type: 'control',
      data: action,
      timestamp: Date.now(),
    };

    this.socket.emit('voice:control', message);
  }

  // Speak text using browser's Web Speech API (FREE!)
  speakText(text: string, voiceName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) {
          console.warn('Browser TTS not supported');
          resolve();
          return;
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure speech parameters
        utterance.rate = 1.5;    // Speed (0.1 to 10)
        utterance.pitch = 1.5;   // Pitch (0 to 2)
        utterance.volume = 1.0;  // Volume (0 to 1)
        utterance.lang = 'en-US';

        // Select voice
        if (voiceName) {
          const voice = this.availableVoices.find(v => v.name === voiceName);
          if (voice) {
            utterance.voice = voice;
          }
        } else {
          // Use first English voice
          const englishVoice = this.availableVoices.find(v => 
            v.lang.startsWith('en')
          );
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
        }

        utterance.onend = () => {
          console.log('🔊 Finished speaking');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('TTS error:', event);
          reject(event);
        };

        speechSynthesis.speak(utterance);
        console.log('🔊 Speaking:', text);

      } catch (error) {
        console.error('TTS error:', error);
        reject(error);
      }
    });
  }

  // Stop speaking
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  // Play audio from base64 data (for backward compatibility)
  async playAudio(base64Data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!base64Data || base64Data.length === 0) {
          // Empty audio buffer, skip playback
          resolve();
          return;
        }

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });

        // Create audio URL
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper: Convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:audio/webm;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Event listener setters
  onTranscription(callback: (text: string) => void): void {
    this.onTranscriptionCallback = callback;
  }

  onResponse(callback: (text: string) => void): void {
    this.onResponseCallback = callback;
  }

  onAudio(callback: (audioData: string) => void): void {
    this.onAudioCallback = callback;
  }

  onStatus(callback: (status: string, message: string) => void): void {
    this.onStatusCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  // Disconnect
  disconnect(): void {
    this.stopSpeaking();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check connection status
  isServiceConnected(): boolean {
    return this.isConnected;
  }
}

// Export factory function
export const createVoiceService = (token: string): AIVoiceService => {
  return new AIVoiceService({ token });
};