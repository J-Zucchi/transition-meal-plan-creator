
import { UserSettings, MealPlanResponse } from "../types";

export const generateMealPlan = async (
  settings: UserSettings
): Promise<MealPlanResponse> => {
  const response = await fetch('/.netlify/functions/generate-meal-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate meal plan';
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
