
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
export type CookingStyle = 'Quick & Easy' | 'Balanced Mix' | 'Home Cooked';

export interface UserSettings {
  gender: Gender;
  calories: number;
  cookingStyle: CookingStyle;
  exclusions: string;
  preferences: string;
}
