
import { GoogleGenAI, Type } from "@google/genai";
import { UserSettings, MealPlanResponse } from "../types";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    slots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          options: {
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
        required: ["title", "options"],
      },
    },
  },
  required: ["slots"],
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
const MODELS_TO_TRY = [
  "gemini-3-flash-preview",   // Smartest Flash model
  "gemini-flash-latest",      // Standard Flash (Stable, usually high limits)
  "gemini-flash-lite-latest"  // Fastest/Cheapest backup
];

export const generateMealPlan = async (
  settings: UserSettings
): Promise<MealPlanResponse> => {
  if (!process.env.API_KEY) {
    throw new Error(
      "API Key is missing. Please ensure you have added 'API_KEY' to your Netlify Site Settings > Environment Variables."
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { gender, calories, cookingStyle, exclusions, preferences } = settings;

  // Calculate macro targets based on the requested 35/35/30 split
  // Protein: 35% (4 cal/g)
  // Carbs: 35% (4 cal/g)
  // Fat: 30% (9 cal/g)
  const proteinGrams = Math.round((calories * 0.35) / 4);
  const carbGrams = Math.round((calories * 0.35) / 4);
  const fatGrams = Math.round((calories * 0.30) / 9);

  const randomInstruction = VARIETY_INSTRUCTIONS[Math.floor(Math.random() * VARIETY_INSTRUCTIONS.length)];

  const prompt = `
    You are an expert medical nutritionist for Transition Medical Weight Loss.
    Create a 1-day meal plan for a ${gender} patient with multiple options per meal.
    
    Target Calories: ${calories}
    Cooking Style: ${cookingStyle}
    Exclusions/Allergies: ${exclusions || "None"}
    Patient Preferences/Favorite Foods: ${preferences || "None"}

    Nutritional Goals (35/35/30 Split):
    - Protein: Approximately 35% of total calories. Target: ~${proteinGrams}g. (Allow +/- 5% variance).
    - Carbs: Approximately 35% of total calories. Target: ~${carbGrams}g. (Allow +/- 5% variance).
    - Fats: Approximately 30% of total calories. Target: ~${fatGrams}g. (Allow +/- 5% variance).
    
    *Guidance*: 
    - Ensure meals feel "normal" and sustainable within these macros.
    - Hydration: Implicitly encourage water intake.

    Style & Complexity Guidelines:
    - KEEP IT SIMPLE: Use common supermarkets ingredients.
    - REALISTIC: Ensure meals are easy to prepare.
    - VARIETY HINT: ${randomInstruction}

    Structure:
    Generate exactly 5 meal slots in this order: 
    1. Breakfast
    2. Morning Snack
    3. Lunch
    4. Afternoon Snack
    5. Dinner
    
    CRITICAL INSTRUCTION:
    For EACH of the 5 slots, provide exactly 3 DISTINCT options (Option A, Option B, Option C).
    - Ensure the 3 options are different in main ingredients/flavor (e.g., one egg-based, one yogurt-based, one oat-based).
    - If the user specified preferences (e.g., "Italian"), ensure at least one option reflects that.
    - Ensure all options fit the macro goals for that time of day.

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
    }
  }

  console.error("All models failed. Last error:", lastError);
  
  let errorMessage = "Failed to generate meal plan after multiple attempts.";
  if (lastError?.message) {
    if (lastError.message.includes("429")) errorMessage += " (Daily Quota Exceeded)";
    else if (lastError.message.includes("403")) errorMessage += " (Access Denied)";
    else errorMessage += ` (${lastError.message})`;
  }
  
  throw new Error(errorMessage);
};
