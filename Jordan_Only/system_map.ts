
/**
 * SYSTEM MAP - JORDAN OS
 * ----------------------
 * This map defines the core architecture boundaries for the AlArab Jordan Project.
 * 
 * 1. PERSONA: The "Heart & Soul" - Identity, dialect, and academic knowledge.
 * 2. ENGINE: The "Brain & Voice" - Communication protocols (Gemini/Groq) and Audio IO.
 * 3. ARMS: The "Hands" - External tools, API integrations, and task execution.
 */

export const SYSTEM_MAP = {
  PROJECT: "Jordan_Only",
  VERSION: "2.0.0-MODULAR",
  MASTER: "Said",
  
  CORE_ENTITIES: {
    PERSONA: {
      path: "./persona.ts",
      active: "judy_jordan_edu",
      description: "Handles personality, system instructions, and persona-specific context."
    },
    ENGINE: {
      path: "./engine",
      components: ["Communication", "AudioContext", "LiveStream", "SmartOrchestrator"],
      description: "Low-level I/O and AI bridge logic with cloud/local failover."
    },
    MEMORY: {
      path: "./memory",
      description: "State persistence and context anchoring across sessions."
    },
    ARMS: {
      path: "./arms",
      description: "External capabilities and tool-use scripts."
    }
  },

  RELATIONSHIPS: [
    "App -> Persona (Select Identity)",
    "App -> Engine (Initiate Link)",
    "Engine -> Persona (Apply System Instructions)",
    "Engine -> Memory (Recall Context)",
    "Persona -> Arms (Request Action Execution)"
  ]
};
