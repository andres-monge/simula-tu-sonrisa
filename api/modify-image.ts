import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODIFICATION_CONTEXT_PROMPT = `Eres un experto en estética dental con IA. El usuario ya ha mejorado su sonrisa y ahora quiere hacer una modificación adicional.

CONTEXTO:
- La PRIMERA imagen es la foto ORIGINAL que subió el usuario
- La SEGUNDA imagen es el RESULTADO ACTUAL (la última imagen generada)

Tu tarea es modificar el RESULTADO ACTUAL según la solicitud del usuario, manteniendo la identidad de la persona de la foto original.

INSTRUCCIONES:
1. Aplica SOLO la modificación que el usuario solicita
2. Mantén todos los demás aspectos del resultado actual intactos
3. Asegúrate de que el resultado siga viéndose natural y realista
4. Preserva la iluminación, colores y estilo de la imagen

SOLICITUD DEL USUARIO:`;

async function modifyImage(
  originalImage: string,
  currentResultImage: string,
  userPrompt: string
): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

  const originalMatches = originalImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!originalMatches) {
    throw new Error("Invalid original image format.");
  }

  const currentMatches = currentResultImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!currentMatches) {
    throw new Error("Invalid current result image format.");
  }

  const originalMimeType = originalMatches[1];
  const originalImageData = originalMatches[2];
  const currentMimeType = currentMatches[1];
  const currentImageData = currentMatches[2];

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: originalMimeType,
              data: originalImageData,
            },
          },
          {
            inlineData: {
              mimeType: currentMimeType,
              data: currentImageData,
            },
          },
          {
            text: `${MODIFICATION_CONTEXT_PROMPT} ${userPrompt}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response generated from the AI model");
  }

  const content = candidates[0].content;
  if (!content || !content.parts) {
    throw new Error("Invalid response structure from the AI model");
  }

  for (const part of content.parts) {
    if (part.inlineData && part.inlineData.data) {
      const outputMimeType = part.inlineData.mimeType || "image/png";
      return `data:${outputMimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image was generated in the response");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { originalImage, currentResultImage, userPrompt } = body;

    if (!originalImage || !currentResultImage) {
      return res.status(400).json({ error: "Missing required images" });
    }

    if (typeof userPrompt !== "string" || userPrompt.trim() === "") {
      return res
        .status(400)
        .json({ error: "Please provide a modification request" });
    }

    if (
      typeof originalImage !== "string" ||
      !originalImage.startsWith("data:image/")
    ) {
      return res.status(400).json({ error: "Invalid original image format" });
    }

    if (
      typeof currentResultImage !== "string" ||
      !currentResultImage.startsWith("data:image/")
    ) {
      return res.status(400).json({ error: "Invalid result image format" });
    }

    const modifiedImage = await modifyImage(
      originalImage,
      currentResultImage,
      userPrompt.trim()
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ modifiedImage });
  } catch (error: any) {
    console.error("Modify image error:", error?.message || error);

    if (error.message?.includes("API key") || error.message?.includes("401")) {
      return res.status(500).json({ error: "AI service authentication failed. Please try again." });
    }

    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return res.status(500).json({ error: "API rate limit exceeded. Please try again in a moment." });
    }

    return res.status(500).json({
      error: error?.message || "Failed to modify image",
    });
  }
}
