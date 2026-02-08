import { GoogleGenAI, Type } from "@google/genai";
import { UserSettings, MealPlanResponse } from "../types";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER },
      },
      required: ["calories", "protein", "carbs", "fat"],
    },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fat"],
          },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "type",
          "title",
          "description",
          "prepTime",
          "macros",
          "ingredients",
          "instructions",
        ],
      },
    },
  },
  required: ["summary", "meals"],
};

const VARIETY_INSTRUCTIONS = [
  "Focus on 'Classics made Healthy' - familiar tastes with better macros.",
  "Incorporate a 'One-Pan' or 'Sheet-Pan' concept for dinner.",
  "Focus on fresh, raw textures for lunch and warm, comforting textures for dinner.",
  "Use common pantry spices to add flavor without complexity.",
  "Try to include a breakfast that can be prepped in under 5 minutes.",
  "Focus on high-volume foods to maximize satiety.",
  "Incorporate a simple wrap or sandwich concept for lunch.",
  "Ensure dinner feels substantial but uses standard supermarket ingredients.",
];

// Priority list of models to try.
// If the first one hits a rate limit (429), we try the next.
// This effectively multiplies the daily free tier limit.
const MODELS_TO_TRY = [
  "gemini-3-flash-preview",   // Smartest Flash model
  "gemini-flash-latest",      // Standard Flash (Stable, usually high limits)
  "gemini-flash-lite-latest"  // Fastest/Cheapest backup
];

export const generateMealPlan = async (
  settings: UserSettings
): Promise<MealPlanResponse> => {
  // 1. Check for API Key explicitly
  if (!process.env.API_KEY) {
    throw new Error(
      "API Key is missing. Please ensure you have added 'API_KEY' to your Netlify Site Settings > Environment Variables."
    );
  }

  // Initialize Gemini Client inside the function to ensure env vars are loaded
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { gender, calories, cookingStyle, exclusions } = settings;

  const proteinTarget = calories >= 1350 ? "120-130g" : "approx 100g";
  const carbsTarget =
    calories < 1400 ? "60-100g" : "100-150g (Focus on fiber-rich sources)";

  const randomInstruction = VARIETY_INSTRUCTIONS[Math.floor(Math.random() * VARIETY_INSTRUCTIONS.length)];

  const prompt = `
    You are an expert medical nutritionist for Transition Medical Weight Loss.
    Create a 1-day meal plan for a ${gender} patient.
    
    Target Calories: ${calories}
    Cooking Style: ${cookingStyle}
    Exclusions/Allergies: ${exclusions || "None"}

    Nutritional Goals:
    - Protein Target: ${proteinTarget}. Critical for muscle mass.
    - Carbs Target: ${carbsTarget}.
    - IMPORTANT: NOT a ketogenic diet. Focus on quality sources.
    - Hydration: Implicitly encourage water intake.

    Style & Complexity Guidelines:
    - KEEP IT SIMPLE: Use common supermarkets ingredients.
    - REALISTIC: Ensure meals are easy to prepare.
    - VARIETY HINT: ${randomInstruction}

    Structure:
    Generate exactly 5 meals: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner.

    Format Requirements:
    - Return strictly pure JSON matching the schema.
    - No markdown formatting.
  `;

  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generation with model: ${model}`);
      
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as MealPlanResponse;
      }
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      
      // If the error is NOT a quota/server error (e.g., it's a prompt safety error), 
      // we generally still want to try the next model just in case, 
      // but primarily we are catching 429 (Too Many Requests) and 503 (Overloaded).
    }
  }

  // If we get here, all models failed
  console.error("All models failed. Last error:", lastError);
  
  let errorMessage = "Failed to generate meal plan after multiple attempts.";
  if (lastError?.message) {
    if (lastError.message.includes("429")) errorMessage += " (Daily Quota Exceeded)";
    else if (lastError.message.includes("403")) errorMessage += " (Access Denied)";
    else errorMessage += ` (${lastError.message})`;
  }
  
  throw new Error(errorMessage);
};
