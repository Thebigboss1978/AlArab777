
/**
 * ARMS - THE EXECUTION LAYER
 * --------------------------
 * Defines the tools and external actions available to the personas.
 */

export interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export const ARMS: Record<string, Tool> = {
  university_search: {
    name: 'university_search',
    description: 'Search for Jordanian universities and programs.',
    execute: async (args) => {
      console.log('Searching for university:', args);
      return { results: [`University of Jordan`, `Yarmouk University`] };
    }
  },
  admission_check: {
    name: 'admission_check',
    description: 'Check admission requirements for a specific major.',
    execute: async (args) => {
      return { status: "Available", criteria: "Average > 85%" };
    }
  }
};
