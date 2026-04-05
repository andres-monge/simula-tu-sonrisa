import type { VercelRequest, VercelResponse } from "@vercel/node";
import { modifyImage } from "../server/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { originalImage, currentResultImage, userPrompt } = body;

    if (!originalImage || !currentResultImage) {
      return res.status(400).json({ error: "Faltan imágenes requeridas" });
    }

    if (typeof userPrompt !== "string" || userPrompt.trim() === "") {
      return res.status(400).json({ error: "Por favor, proporcione una solicitud de modificación" });
    }

    if (typeof originalImage !== "string" || !originalImage.startsWith("data:image/")) {
      return res.status(400).json({ error: "Formato de imagen original no válido" });
    }

    if (typeof currentResultImage !== "string" || !currentResultImage.startsWith("data:image/")) {
      return res.status(400).json({ error: "Formato de imagen resultado no válido" });
    }

    const modifiedImage = await modifyImage(originalImage, currentResultImage, userPrompt.trim());
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ modifiedImage });
  } catch (error: any) {
    console.error("Modify image error:", error?.message || error);
    const statusCode =
      typeof error?.statusCode === "number" ? error.statusCode : 500;
    return res.status(statusCode).json({
      error: error?.message || "Error al modificar la imagen",
    });
  }
}
