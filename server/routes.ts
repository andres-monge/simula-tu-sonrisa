import type { Express } from "express";
import { createServer, type Server } from "http";
import { enhanceSmile } from "./gemini";
import { sanitizeForLogging } from "./logger";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API endpoint for smile enhancement using Gemini
  app.post("/api/enhance-smile", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (typeof image !== "string" || !image.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      const enhancedImage = await enhanceSmile(image);
      
      res.json({ enhancedImage });
    } catch (error: any) {
      console.error("Enhance smile error:", sanitizeForLogging(error));
      res.status(500).json({ 
        error: error.message || "Failed to process image" 
      });
    }
  });

  return httpServer;
}