import type { VercelRequest, VercelResponse } from "@vercel/node";
import { enhanceSmile } from "../server/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { image } = body;

    if (!image) {
      return res.status(400).json({ error: "No se proporcionó imagen" });
    }

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Formato de imagen no válido" });
    }

    const enhancedImage = await enhanceSmile(image);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ enhancedImage });
  } catch (error: any) {
    console.error("Enhance smile error:", error?.message || error);
    const statusCode =
      typeof error?.statusCode === "number" ? error.statusCode : 500;
    return res.status(statusCode).json({
      error: error?.message || "Error al procesar la imagen",
    });
  }
}
