import { GoogleGenAI, Modality } from "@google/genai";
import { sanitizeForLogging } from "./logger";

// Using Replit's AI Integrations for Gemini access
// This provides Gemini-compatible API access without requiring your own API key
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const SMILE_ENHANCEMENT_PROMPT = `You are an expert dental aesthetics AI. Your task is to enhance the smile in this photo while maintaining the person's natural appearance.

Instructions:
1. Improve the teeth appearance: make them a natural pearly white, straighter, and more symmetrical
2. Enhance the smile to look natural and beautiful
3. Keep the rest of the face and image exactly the same
4. Maintain the original lighting, colors, and style of the photo
5. The result should look realistic and achievable through dental treatments

Create a beautiful, natural-looking smile transformation that shows what professional dental aesthetics could achieve.`;

export async function enhanceSmile(base64Image: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
  
  // Extract the base64 data and mime type from the data URL
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image format. Please provide a valid base64 image.");
  }
  
  const mimeType = matches[1];
  const imageData = matches[2];

  try {
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

    // Find the image part in the response
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const outputMimeType = part.inlineData.mimeType || "image/png";
        return `data:${outputMimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image was generated in the response");
  } catch (error: any) {
    console.error("Gemini API error:", sanitizeForLogging(error));
    
    if (error.message?.includes("API key") || error.message?.includes("401")) {
      throw new Error("AI service authentication failed. Please try again.");
    }
    
    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      throw new Error("API rate limit exceeded. Please try again in a moment.");
    }
    
    throw new Error(`Failed to enhance smile: ${error.message || "Unknown error"}`);
  }
}

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

export async function modifyImage(
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

  try {
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
  } catch (error: any) {
    console.error("Gemini API error:", sanitizeForLogging(error));
    
    if (error.message?.includes("API key") || error.message?.includes("401")) {
      throw new Error("AI service authentication failed. Please try again.");
    }
    
    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      throw new Error("API rate limit exceeded. Please try again in a moment.");
    }
    
    throw new Error(`Failed to modify image: ${error.message || "Unknown error"}`);
  }
}