
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
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
                    calories: { type: Type.INTEGER, description: "Numeric value only, no units" },
                    protein: { type: Type.INTEGER, description: "Numeric value only in grams, no units" },
                    carbs: { type: Type.INTEGER, description: "Numeric value only in grams, no units" },
                    fat: { type: Type.INTEGER, description: "Numeric value only in grams, no units" },
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

const MODELS_TO_TRY = [
  "gemini-3-flash-preview",         // Smartest Flash model (20 RPD)
  "gemini-3.1-flash-lite-preview"   // Fastest/Cheapest backup (500 RPD)
];

function parsePartialJSON(jsonString: string): any {
  let str = jsonString.trim();
  if (!str) return null;
  
  try { return JSON.parse(str); } catch (e) {}
  
  let inString = false;
  let escape = false;
  const stack = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (escape) { escape = false; continue; }
    if (char === '\\') { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    
    if (!inString) {
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') stack.pop();
    }
  }
  
  if (inString) str += '"';
  
  for (let i = stack.length - 1; i >= 0; i--) {
    str = str.replace(/,\s*$/, '');
    str += stack[i];
  }
  
  try { return JSON.parse(str); } catch (e) { return null; }
}

export const generateMealPlanStream = async function* (
  settings: UserSettings
): AsyncGenerator<MealPlanResponse, void, unknown> {
  if (import.meta.env.PROD) {
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

    if (!response.body) throw new Error("No response body");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulatedText += decoder.decode(value, { stream: true });
      const partial = parsePartialJSON(accumulatedText);
      if (partial) {
        if (partial.error) {
          throw new Error(partial.error);
        }
        yield partial;
      }
    }
    return;
  }

  // In development (AI Studio), call Gemini directly from the frontend
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const { gender, calories, creativityLevel, exclusions, preferences, previousMeals } = settings;

  const proteinGrams = Math.round((calories * 0.33) / 4);
  const carbGrams = Math.round((calories * 0.34) / 4);
  const fatGrams = Math.round((calories * 0.33) / 9);

  let creativityPrompt = "";
  if (creativityLevel === 1) {
    creativityPrompt = "Level 1: Quick & Simple. Focus on extreme simplicity. 5 ingredients or less. Minimal prep time. Use basic, familiar foods (e.g., basic proteins, standard veggies, simple carbs). Prioritize speed over culinary creativity, but ensure it remains tasty.";
  } else if (creativityLevel === 3) {
    creativityPrompt = "Level 3: Culinary & Creative. Focus on highly creative, 'Instagram-worthy' healthy meals. Draw inspiration from trending healthy recipes (e.g., cottage cheese flatbreads, macro-friendly bowls, unique sauces). Use bold flavor profiles, trendy health ingredients, and unique combinations. Make it exciting for a foodie who enjoys cooking and doesn't mind longer prep times.";
  } else {
    creativityPrompt = "Level 2: Balanced Variety. Focus on 'Classics made Healthy'. Flavorful but accessible. Use common pantry spices. Meals should be interesting but not require advanced cooking skills or obscure ingredients. Include simple wraps, bowls, and fun flavor ideas.";
  }

  const previousMealsText = previousMeals && previousMeals.length > 0 
    ? `\n    Previous Meals Generated: ${previousMeals.join(', ')}\n    CRITICAL: Do not reuse more than 50% of these previous meals. Provide fresh, new ideas for the majority of the options.`
    : "";

  const prompt = `
    You are an expert medical nutritionist for Transition Medical Weight Loss.
    Create a 1-day meal plan for a ${gender} patient with multiple options per meal.
    
    Target Calories: ${calories}
    Creativity Level: ${creativityLevel}
    Exclusions/Allergies: ${exclusions || "None"}
    Patient Preferences/Favorite Foods: ${preferences || "None"}
    ${previousMealsText}

    Nutritional Goals (33/34/33 Split):
    - Protein: Approximately 33% of total calories. Target: ~${proteinGrams}g. (Allow +/- 5% variance).
    - Carbs: Approximately 34% of total calories. Target: ~${carbGrams}g. (Allow +/- 5% variance).
    - Fats: Approximately 33% of total calories. Target: ~${fatGrams}g. (Allow +/- 5% variance).
    
    *Guidance*: 
    - Ensure meals feel "normal" and sustainable within these macros.
    - Hydration: Implicitly encourage water intake.

    Style & Complexity Guidelines:
    ${creativityPrompt}
    - Convenience Foods: Occasionally suggest specific, well-known brand products to make shopping easier (e.g., Quest bar, RX bar, Oikos Pro or Chobani zero sugar yogurt, Banza chickpea pasta, P3 protein snacks, Orgain 30 gram protein shake). Tap into the many other healthy, macro-friendly brands available on the market beyond just this list.
    - Clinic Products: Occasionally (maximum 1 time per day) suggest the clinic's own products for a snack. Refer to them exactly as "Transition Protein Bar" (approx 150 calories, 15g protein, high fiber) or "Transition Protein Drink" (approx 70 calories, 15g protein). Do not overdo it.
    - Leftovers: For Lunch, prioritize 'No-Cook' options, wraps, or meals that explicitly use leftovers from typical dinners to save time.

    Structure & Calorie Distribution:
    Generate exactly 5 meal slots in this order:
    1. Breakfast
    2. Morning Snack
    3. Lunch
    4. Afternoon Snack
    5. Dinner
    
    Distribute the calories naturally across the 3 main meals and 2 snacks. The total daily calories for ANY combination of options MUST stay within +/- 100 calories of the Target Calories (${calories}).
    To achieve this, ensure that Option A, Option B, and Option C for a given meal slot have very similar total calorie counts, even if their specific macros (protein/carbs/fat) vary based on the ingredients.
    
    CRITICAL INSTRUCTION:
    For EACH of the 5 slots, provide exactly 3 DISTINCT options (Option A, Option B, Option C).
    - Ensure Option A, Option B, and Option C use completely different cooking methods, textures, and flavor profiles to maximize variety.
    - Calculate macros based on the ACTUAL ingredients provided. Option A, Option B, and Option C MUST have slightly different macros based on their unique ingredients, but their TOTAL CALORIES should be roughly the same to keep the daily total stable. Do NOT copy/paste the exact same macro numbers across options.
    - For the 'type' field, provide a short 1-2 word category tag (e.g., 'Egg-based', 'High-Protein', 'No-Cook', 'Grab-and-Go'). Do NOT repeat the title.
    - All ingredients MUST include exact, easy-to-understand portion sizes (e.g., '4 oz grilled chicken breast', '1/2 cup cooked jasmine rice', '1 scoop whey protein'). Do not just list 'chicken' or 'rice'.
    - If the user specified preferences (e.g., "Italian"), ensure at least one option reflects that.
    - Ensure all options roughly fit the macro goals for that time of day, but accuracy of the food item is more important.

    Format Requirements:
    - Return strictly pure JSON matching the schema.
    - No markdown formatting.
  `;

  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generation with model: ${model}`);
      
      const stream = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      let accumulatedText = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          const partial = parsePartialJSON(accumulatedText);
          if (partial) yield partial;
        }
      }
      return; // Success, exit the loop
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1500));
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
