import type { Express } from "express";
import { createServer, type Server } from "http";
import { enhanceSmile, modifyImage } from "./gemini";
import { sanitizeForLogging } from "./logger";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/enhance-smile", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No se proporcionó imagen" });
      }

      if (typeof image !== "string" || !image.startsWith("data:image/")) {
        return res.status(400).json({ error: "Formato de imagen no válido" });
      }

      const enhancedImage = await enhanceSmile(image);
      res.json({ enhancedImage });
    } catch (error: any) {
      console.error("Enhance smile error:", sanitizeForLogging(error));
      const statusCode =
        typeof error?.statusCode === "number" ? error.statusCode : 500;
      res.status(statusCode).json({ error: error?.message || "Error al procesar la imagen" });
    }
  });

  app.post("/api/modify-image", async (req, res) => {
    try {
      const { originalImage, currentResultImage, userPrompt } = req.body;

      if (!originalImage || !currentResultImage) {
        return res.status(400).json({ error: "Faltan imágenes requeridas" });
      }

      if (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim() === "") {
        return res.status(400).json({ error: "Por favor, proporcione una solicitud de modificación" });
      }

      if (typeof originalImage !== "string" || !originalImage.startsWith("data:image/")) {
        return res.status(400).json({ error: "Formato de imagen original no válido" });
      }

      if (typeof currentResultImage !== "string" || !currentResultImage.startsWith("data:image/")) {
        return res.status(400).json({ error: "Formato de imagen resultado no válido" });
      }

      const modifiedImage = await modifyImage(originalImage, currentResultImage, userPrompt.trim());
      res.json({ modifiedImage });
    } catch (error: any) {
      console.error("Modify image error:", sanitizeForLogging(error));
      const statusCode =
        typeof error?.statusCode === "number" ? error.statusCode : 500;
      res.status(statusCode).json({ error: error?.message || "Error al modificar la imagen" });
    }
  });

  return httpServer;
}
