import { handler } from "./netlify/functions/generate-meal-plan.ts";

async function test() {
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "exists" : "missing");
  console.log("API_KEY:", process.env.API_KEY ? "exists" : "missing");
  
  const res = await handler({
    httpMethod: "POST",
    body: JSON.stringify({
      gender: "Female",
      calories: 1100,
      cookingStyle: "Balanced",
      exclusions: "",
      preferences: ""
    })
  }, {});
  console.log(res);
}
test();
