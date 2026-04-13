
export interface Macro {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  type: string;
  title: string;
  description: string;
  prepTime: string;
  macros: Macro;
  ingredients: string[];
  instructions: string[];
}

export interface MealSlot {
  title: string;
  options: Meal[];
}

export interface MealPlanResponse {
  slots: MealSlot[];
}

export type Gender = 'Female' | 'Male';

export interface UserSettings {
  gender: Gender;
  calories: number;
  creativityLevel: 1 | 2 | 3;
  exclusions: string;
  preferences: string;
  previousMeals?: string[];
}
