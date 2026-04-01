import dotenv from "dotenv";
// Load environment variables from .env.local for local development
dotenv.config({ path: ".env.local" });
// Also load from .env as a fallback
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import generateMealPlanHandler from "./netlify/functions/generate-meal-plan";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // Mock Netlify Function Endpoint for local development
  app.all("/.netlify/functions/generate-meal-plan", async (req, res) => {
    const url = `http://localhost:${PORT}${req.url}`;
    const init: RequestInit = {
      method: req.method,
      headers: req.headers as HeadersInit,
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body);
    }
    const webReq = new Request(url, init);

    try {
      const response = await generateMealPlanHandler(webReq, {});
      
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.status(response.status);
      
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
