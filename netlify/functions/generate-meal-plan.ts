import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

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

// Priority list of models to try.
const MODELS_TO_TRY = [
  "gemini-3-flash-preview",         // Smartest Flash model
  "gemini-3.1-flash-lite-preview"   // Fastest backup
];

export default async (req: Request, context: any) => {
  // CORS headers for Netlify
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  // Use GEMINI_API_KEY (AI Studio standard) or API_KEY (User's Netlify setup)
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API Key is missing in environment variables. Please add GEMINI_API_KEY to your Netlify settings." }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const settings = await req.json();
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
      ? `\n      Previous Meals Generated: ${previousMeals.join(', ')}\n      CRITICAL: Do not reuse more than 50% of these previous meals. Provide fresh, new ideas for the majority of the options.`
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
      - Clinic Products: Occasionally suggest the clinic's own products for a snack. Refer to them exactly as "Transition Protein Bar" (approx 150 calories, 15g protein, high fiber) or "Transition Protein Drink" (a powder packet mixed with water, approx 70 calories, 15g protein). CRITICAL: You MUST NOT include more than ONE Transition product in the ENTIRE daily plan. If you suggest a Transition product for one snack, you CANNOT suggest it anywhere else.
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
      - Return strictly pure JSON matching the schema. No markdown formatting.
    `;

    let lastError: any = null;
    let successfulStream: any = null;

    for (const model of MODELS_TO_TRY) {
      try {
        console.log(`Attempting generation with model: ${model}`);
        
        successfulStream = await ai.models.generateContentStream({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        // If we reach here, the initial API request succeeded
        break;

      } catch (error: any) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;
        // Wait 1.5 seconds before trying the next model to avoid burst rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    if (!successfulStream) {
      console.error("All models failed. Last error:", lastError);
      
      let errorMessage = "Failed to generate meal plan after multiple attempts.";
      if (lastError?.message) {
        if (lastError.message.includes("429")) errorMessage += " (Daily Quota Exceeded)";
        else if (lastError.message.includes("403")) errorMessage += " (Access Denied)";
        else errorMessage += ` (${lastError.message})`;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Keep-alive interval: Send a space character every 2 seconds
        // This prevents Netlify's 10-second serverless function timeout
        // while the AI is "thinking" (ThinkingLevel.HIGH).
        // JSON.parse on the frontend will safely ignore leading whitespace.
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(" "));
        }, 2000);

        try {
          for await (const chunk of successfulStream) {
            if (keepAlive) clearInterval(keepAlive);
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (streamErr: any) {
          if (keepAlive) clearInterval(keepAlive);
          console.error("Stream error:", streamErr);
          // If we fail here, we stream an error object because headers are already sent
          controller.enqueue(encoder.encode(JSON.stringify({ error: streamErr.message || "Streaming failed" })));
        } finally {
          if (keepAlive) clearInterval(keepAlive);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/plain"
      }
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
};

export const config = {
  path: "/.netlify/functions/generate-meal-plan"
};
