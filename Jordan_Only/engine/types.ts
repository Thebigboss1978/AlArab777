
export interface ConnectionConfig {
  apiKey?: string;
  groqApiKey?: string;
  model?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface TranscriptionItem {
  id: string;
  text: string;
  sender: 'user' | 'model';
  timestamp: Date;
}
