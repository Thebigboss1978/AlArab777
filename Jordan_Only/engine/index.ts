
import { ConnectionStatus, ConnectionConfig } from './types';

export class BaseEngine {
  protected status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  
  constructor(protected config: ConnectionConfig) {}

  getStatus() { return this.status; }
}

// Concrete implementations for Groq and Gemini would go here.
// For now, we are mapping the architecture.
