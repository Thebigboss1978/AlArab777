
/**
 * MEMORY LAYER - THE SYSTEM SOUL
 * ------------------------------
 * Handles persistent state and user context across identity shifts.
 */

export interface UserContext {
  userId: string;
  preferences: {
    dialect: 'ammani' | 'irbidi' | 'general_jo';
    ageMode: 'adult' | 'child';
    lastMajorOfInterest?: string;
  };
  shortlistedUniversities: string[];
}

export class MemoryManager {
  private static STORAGE_KEY = 'JORDAN_SOVEREIGN_CONTEXT';

  static saveContext(context: UserContext) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
  }

  static getContext(): UserContext | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Sovereignty Note: Using localStorage (Local First) 
  // instead of a Cloud DB (like Firebase) to ensure 100% data ownership.
}
