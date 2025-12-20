// ============================================
// File: lib/aiVoiceService.ts
// Frontend Voice Service - FIXED CONNECTION
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
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5; // Increased from 3
  
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
    
    console.log(`🔧 Voice Service Config:`, {
      backendUrl: this.backendUrl,
      hasToken: !!this.token
    });
  }

  // Initialize browser's Text-to-Speech (FREE!)
  private initializeBrowserTTS(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.availableVoices = speechSynthesis.getVoices();
        console.log(`✅ Loaded ${this.availableVoices.length} TTS voices`);
      };

      loadVoices();
      
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('⚠️ Browser Text-to-Speech not supported');
    }
  }

  // Connect to backend WebSocket with proper error handling
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Attempting to connect to: ${this.backendUrl}`);
        
        // Close existing connection if any
        if (this.socket?.connected) {
          console.log('🔄 Closing existing connection...');
          this.socket.disconnect();
        }

        // ✅ FIXED: Better Socket.IO configuration
        this.socket = io(this.backendUrl, {
          auth: {
            token: this.token,
          },
          transports: ['polling', 'websocket'], // ✅ Try polling first (more reliable)
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxConnectionAttempts,
          timeout: 20000, // ✅ Increased to 20 seconds
          forceNew: true,
          upgrade: true, // Will upgrade from polling to websocket
          rememberUpgrade: true,
          autoConnect: true, // ✅ Auto-connect
        });

        // ✅ FIXED: More lenient timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('❌ Connection timeout after 20 seconds');
            this.socket?.disconnect();
            reject(new Error('Connection timeout - Backend may not be running on ' + this.backendUrl));
          }
        }, 20000);

        // Connection established
        this.socket.on('connect', () => {
          console.log('✅ Socket.IO connected with ID:', this.socket?.id);
          console.log('   Transport:', this.socket?.io.engine.transport.name);
          // Don't clear timeout yet - wait for voice:connected
        });

        // ✅ CRITICAL: This is the actual confirmation
        this.socket.on('voice:connected', (data: any) => {
          console.log('✅ Voice service confirmed:', data);
          this.isConnected = true;
          this.connectionAttempts = 0;
          clearTimeout(connectionTimeout);
          this.onConnectedCallback?.();
          resolve();
        });

        // Transcription received (user's speech)
        this.socket.on('voice:text', (data: VoiceResponse) => {
          console.log('📝 Received voice:text event:', data);
          
          if (data.type === 'transcription' && data.text) {
            console.log('📝 Transcription:', data.text);
            this.onTranscriptionCallback?.(data.text);
          } else if (data.type === 'response' && data.text) {
            console.log('🤖 AI Response:', data.text);
            this.onResponseCallback?.(data.text);
          }
        });

        // Audio response received
        this.socket.on('voice:audio', (data: VoiceResponse) => {
          console.log('🔊 Received audio response');
          if (data.data) {
            this.onAudioCallback?.(data.data);
          }
        });

        // Status updates
        this.socket.on('voice:status', (data: VoiceResponse) => {
          console.log('📊 Status update:', data);
          if (data.status && data.message) {
            this.onStatusCallback?.(data.status, data.message);
          }
        });

        // Errors
        this.socket.on('voice:error', (data: VoiceResponse) => {
          console.error('❌ Voice error:', data);
          if (data.error) {
            this.onErrorCallback?.(data.error);
          }
        });

        // Connection error
        this.socket.on('connect_error', (error: Error) => {
          this.connectionAttempts++;
          console.error(`❌ Connection error (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}):`, error.message);
          
          this.isConnected = false;
          
          if (this.connectionAttempts >= this.maxConnectionAttempts) {
            clearTimeout(connectionTimeout);
            
            let errorMessage = 'Failed to connect to voice service after ' + this.maxConnectionAttempts + ' attempts. ';
            
            if (error.message.includes('xhr poll error')) {
              errorMessage += 'Backend server may not be running on ' + this.backendUrl;
            } else if (error.message.includes('websocket error')) {
              errorMessage += 'WebSocket connection failed. Ensure backend is running.';
            } else {
              errorMessage += error.message;
            }
            
            this.onErrorCallback?.(errorMessage);
            reject(new Error(errorMessage));
          }
        });

        // Disconnected
        this.socket.on('disconnect', (reason: string) => {
          console.log('📡 Disconnected from voice service. Reason:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            console.log('🔄 Server disconnected, attempting reconnect...');
            this.socket?.connect();
          }
        });

        // Reconnection attempts
        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
          console.log(`✅ Reconnected after ${attemptNumber} attempts`);
          this.isConnected = true;
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Reconnection failed');
          clearTimeout(connectionTimeout);
          reject(new Error('Failed to reconnect to voice service'));
        });

        // ✅ Added: Log all events for debugging
        this.socket.onAny((eventName, ...args) => {
          console.log(`📡 Received event: ${eventName}`, args);
        });

      } catch (error) {
        console.error('❌ Socket initialization error:', error);
        reject(error);
      }
    });
  }

  // Send audio to backend for processing
  async sendAudio(audioBlob: Blob, voice: string = 'default'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      const error = 'Not connected to voice service';
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      console.log('📤 Sending audio to backend...', {
        size: audioBlob.size,
        type: audioBlob.type,
        voice
      });

      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      const message: VoiceMessage = {
        type: 'audio',
        data: base64Audio,
        timestamp: Date.now(),
        voice,
      };

      this.socket.emit('voice:audio', message);
      console.log('✅ Audio sent successfully');
    } catch (error) {
      console.error('❌ Error sending audio:', error);
      throw error;
    }
  }

  // Send text to backend for AI response
  async sendText(text: string, voice: string = 'default'): Promise<void> {
    if (!this.socket || !this.isConnected) {
      const error = 'Not connected to voice service';
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      console.log('📤 Sending text to backend:', text);

      const message: VoiceMessage = {
        type: 'text',
        data: text,
        timestamp: Date.now(),
        voice,
      };

      this.socket.emit('voice:text', message);
      console.log('✅ Text sent successfully');
    } catch (error) {
      console.error('❌ Error sending text:', error);
      throw error;
    }
  }

  // Send control messages (start, stop, mute, etc.)
  sendControl(action: 'start' | 'stop' | 'mute' | 'unmute'): void {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Not connected to voice service');
      throw new Error('Not connected to voice service');
    }

    console.log('🎮 Sending control:', action);

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
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
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
        console.log('🔊 Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

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

  // Play audio from base64 data
  async playAudio(base64Data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!base64Data || base64Data.length === 0) {
          resolve();
          return;
        }

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });

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
    console.log('🔌 Disconnecting voice service...');
    this.stopSpeaking();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    
    console.log('✅ Voice service disconnected');
  }

  // Check connection status
  isServiceConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get connection info for debugging
  getConnectionInfo(): { connected: boolean; url: string; socketId?: string } {
    return {
      connected: this.isConnected,
      url: this.backendUrl,
      socketId: this.socket?.id,
    };
  }
}

// Export factory function
export const createVoiceService = (token: string): AIVoiceService => {
  return new AIVoiceService({ token });
};