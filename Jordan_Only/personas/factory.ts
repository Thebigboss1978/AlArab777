
import { Persona } from '../persona';

export type IdentityTrait = 'CHILD' | 'ADULT' | 'PROFESSIONAL' | 'FRIENDLY';
export type DomainScope = 'JORDAN_EDU' | 'EGYPT_TOURISM' | 'GENERAL';

interface IdentityConfig {
  traits: IdentityTrait[];
  scope: DomainScope;
  basePrompt: string;
}

export const createSystemInstruction = (config: IdentityConfig): string => {
  let instruction = config.basePrompt + "\n\n";

  if (config.traits.includes('CHILD')) {
    instruction += "TONE: Use simple words, very enthusiastic, curious, and playful like a child.\n";
  } else if (config.traits.includes('PROFESSIONAL')) {
    instruction += "TONE: Formal, accurate, brief, and highly professional.\n";
  }

  if (config.scope === 'JORDAN_EDU') {
    instruction += "SCOPE: You are a specialist in Jordanian schools, universities, and student life. DO NOT discuss non-academic topics unless requested.\n";
  }

  return instruction;
};

// Example Factory Helper
export const buildPersona = (id: string, name: string, config: IdentityConfig): Persona => {
  return {
    id,
    name,
    title: `${name} - ${config.scope}`,
    description: `Dynamic ${config.traits.join(', ')} assistant for ${config.scope}`,
    theme: 'purple',
    voice: config.traits.includes('CHILD') ? 'Puck' : 'Kore',
    systemInstruction: createSystemInstruction(config)
  };
};
