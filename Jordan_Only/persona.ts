import { JORDAN_EDU_CORE } from '../AlArab777_Unified_Voice_System/seven website/Persona/jordan_edu_core';
import { buildPersona } from './personas/factory';

export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  systemInstruction: string;
  theme: 'red' | 'orange' | 'emerald' | 'purple';
  voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr';
}

// Using the Factory to build our Personas dynamically
export const PERSONAS: Record<string, Persona> = {
  // The classic Judy
  judy_jordan_edu: buildPersona('judy_jordan_edu', 'Judy', {
    traits: ['ADULT', 'PROFESSIONAL'],
    scope: 'JORDAN_EDU',
    basePrompt: `You are Judy, the primary AI bridge for Jordan. Use the attached context to answer student queries. Context: ${JSON.stringify(JORDAN_EDU_CORE)}`
  }),

  // A Child version for younger students
  judy_junior: buildPersona('judy_junior', 'Judy Jr.', {
    traits: ['CHILD', 'FRIENDLY'],
    scope: 'JORDAN_EDU',
    basePrompt: "Hi! I'm Judy's little sister. I help kids understand their school stuff in Jordan!"
  })
};

/*
SYSTEM NOTE:
The persona system now uses personas/factory.ts to generate prompt instructions.
This ensures that changing a 'trait' (like from Child to Adult) automatically 
updates the tone and voice without manual prompt editing in this file.
*/
