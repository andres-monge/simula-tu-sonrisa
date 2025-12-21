import type { Express } from "express";
import { createServer, type Server } from "http";
import { enhanceSmile, modifyImage } from "./gemini";
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

  app.post("/api/modify-image", async (req, res) => {
    try {
      const { originalImage, currentResultImage, userPrompt } = req.body;
      
      if (!originalImage || !currentResultImage) {
        return res.status(400).json({ error: "Missing required images" });
      }

      if (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim() === "") {
        return res.status(400).json({ error: "Please provide a modification request" });
      }

      if (typeof originalImage !== "string" || !originalImage.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid original image format" });
      }

      if (typeof currentResultImage !== "string" || !currentResultImage.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid result image format" });
      }

      const modifiedImage = await modifyImage(originalImage, currentResultImage, userPrompt.trim());
      
      res.json({ modifiedImage });
    } catch (error: any) {
      console.error("Modify image error:", sanitizeForLogging(error));
      res.status(500).json({ 
        error: error.message || "Failed to modify image" 
      });
    }
  });

  return httpServer;
}