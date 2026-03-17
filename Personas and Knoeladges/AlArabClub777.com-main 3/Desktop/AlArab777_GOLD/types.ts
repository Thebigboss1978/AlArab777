export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  originalPrice: number;
  discountedPrice: number;
  imageUrl: string;
  features: string[];
  reviews: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface VoiceConfig {
  voiceName: string;
  model: string;
}

export enum AgentState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING', // Connected and microphone is open
  SPEAKING = 'SPEAKING',   // Model is talking
  ERROR = 'ERROR'
}
