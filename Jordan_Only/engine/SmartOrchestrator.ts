
import { ConnectionStatus } from './types';

export class SmartOrchestrator {
  private currentEngine: 'GEMINI' | 'GROQ' | 'LOCAL_OLLAMA' = 'GEMINI';
  private retryCount = 0;
  private maxRetries = 3;

  constructor(private callbacks: {
    onStatusChange: (status: ConnectionStatus) => void;
    onMessage: (message: string) => void;
    onError: (error: string) => void;
    startGemini: (text: string, instruction: string) => Promise<void>;
    startGroq: (text: string, instruction: string) => Promise<void>;
    startLocal: (text: string, instruction: string) => Promise<void>;
  }) {}

  async processInput(text: string, personaInstruction: string, mode: 'FAST' | 'ACCURATE' = 'ACCURATE') {
    this.callbacks.onStatusChange(ConnectionStatus.CONNECTING);
    this.retryCount = 0;
    
    // Adaptive Routing: Prioritize Groq for FAST (voice), Gemini for ACCURATE
    if (mode === 'FAST') {
      this.currentEngine = 'GROQ';
    } else {
      this.currentEngine = 'GEMINI';
    }

    await this.executeWithFailover(text, personaInstruction);
  }

  private async executeWithFailover(text: string, instruction: string) {
    try {
      switch (this.currentEngine) {
        case 'GEMINI':
          console.log("Attempting Gemini Cloud...");
          await this.callbacks.startGemini(text, instruction);
          break;
        case 'GROQ':
          console.log("Attempting Groq 70B Cloud...");
          await this.callbacks.startGroq(text, instruction);
          break;
        case 'LOCAL_OLLAMA':
          console.log("Activating SOVEREIGN_LOCAL (Ollama)...");
          await this.callbacks.startLocal(text, instruction);
          break;
      }
      this.retryCount = 0;
    } catch (error) {
      console.warn(`Engine ${this.currentEngine} error:`, error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        // Rotation: Gemini -> Groq -> Local
        if (this.currentEngine === 'GEMINI') this.currentEngine = 'GROQ';
        else if (this.currentEngine === 'GROQ') this.currentEngine = 'LOCAL_OLLAMA';
        else this.currentEngine = 'GEMINI';
        
        console.log(`FAILOVER: Switching to ${this.currentEngine} (Retry ${this.retryCount})`);
        await this.executeWithFailover(text, instruction);
      } else {
        this.callbacks.onError("GLOBAL_LINK_FAILED: All cloud engines are unreachable. System isolated.");
        this.callbacks.onStatusChange(ConnectionStatus.ERROR);
      }
    }
  }

  getCurrentEngine() { return this.currentEngine; }
}
