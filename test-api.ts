import handler from "./netlify/functions/generate-meal-plan.ts";

async function test() {
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "exists" : "missing");
  console.log("API_KEY:", process.env.API_KEY ? "exists" : "missing");
  
  const req = new Request("http://localhost:3000/.netlify/functions/generate-meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gender: "Female",
      calories: 1100,
      cookingStyle: "Balanced",
      exclusions: "",
      preferences: ""
    })
  });

  const res = await handler(req, {});
  console.log(res);
}
test();
