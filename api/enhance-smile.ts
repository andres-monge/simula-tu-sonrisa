import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SMILE_ENHANCEMENT_PROMPT = `You are an expert dental aesthetics AI. Your task is to enhance the smile in this photo while maintaining the person's natural appearance.

Instructions:
1. Improve the teeth appearance: make them a natural white, straighter, and more symmetrical, as if they were in a toothpaste advert
2. Enhance the smile to look natural and beautiful
3. Keep the rest of the face and image exactly the same
4. Maintain the original lighting, colors, and style of the photo
5. The result should look realistic and achievable through dental treatments

Create a beautiful, natural-looking smile transformation that shows what professional dental aesthetics could achieve.`;

async function enhanceSmile(base64Image: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image format. Please provide a valid base64 image.");
  }

  const mimeType = matches[1];
  const imageData = matches[2];

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageData,
            },
          },
          {
            text: SMILE_ENHANCEMENT_PROMPT,
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
    const { image } = body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const enhancedImage = await enhanceSmile(image);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ enhancedImage });
  } catch (error: any) {
    console.error("Enhance smile error:", error?.message || error);

    if (error.message?.includes("API key") || error.message?.includes("401")) {
      return res.status(500).json({ error: "AI service authentication failed. Please try again." });
    }

    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return res.status(500).json({ error: "API rate limit exceeded. Please try again in a moment." });
    }

    return res.status(500).json({
      error: error?.message || "Failed to process image",
    });
  }
}
