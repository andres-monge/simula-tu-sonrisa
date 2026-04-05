import { GoogleGenAI, Modality } from "@google/genai";
import { sanitizeForLogging } from "./logger";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (ai) return ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno GEMINI_API_KEY.");
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

function getModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
}

class UserFacingError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toUserFacingError(error: unknown, model: string): UserFacingError {
  const message = error instanceof Error ? error.message : String(error || "");
  const status = (error as any)?.status ?? (error as any)?.statusCode ?? (error as any)?.code;

  if (status === 401 || /API key/i.test(message)) {
    return new UserFacingError(401, "Error de autenticación con el servicio de IA. Verifique la configuración.");
  }

  if (status === 404 || (/not found/i.test(message) && /model/i.test(message))) {
    return new UserFacingError(400, "El modelo de IA no está disponible. Contacte al administrador.");
  }

  if (status === 429 || /quota/i.test(message) || /rate/i.test(message)) {
    const isZeroQuota = /limit:\s*0/i.test(message);
    if (isZeroQuota) {
      return new UserFacingError(429,
        "La cuota del servicio de IA está en 0. Active la facturación en Google AI Studio."
      );
    }
    return new UserFacingError(429, "Límite de uso excedido. Por favor, espere un momento e inténtelo de nuevo.");
  }

  return new UserFacingError(500, "Error al procesar la imagen. Por favor, inténtelo de nuevo.");
}

const SMILE_ENHANCEMENT_PROMPT = `You are an expert dental aesthetics AI. Your task is to enhance the smile in this photo while maintaining the person's natural appearance.

Instructions:
1. Improve the teeth appearance: make them a natural pearly white, straighter, and more symmetrical
2. Enhance the smile to look natural and beautiful
3. Keep the rest of the face and image exactly the same
4. Maintain the original lighting, colors, and style of the photo
5. The result should look realistic and achievable through dental treatments

Create a beautiful, natural-looking smile transformation that shows what professional dental aesthetics could achieve.`;

export async function enhanceSmile(base64Image: string): Promise<string> {
  const model = getModel();

  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Formato de imagen no válido.");
  }

  const mimeType = matches[1];
  const imageData = matches[2];

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageData } },
            { text: SMILE_ENHANCEMENT_PROMPT },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No se generó respuesta del modelo de IA");

    for (const part of parts) {
      if (part.inlineData?.data) {
        const outputMimeType = part.inlineData.mimeType || "image/png";
        return `data:${outputMimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No se generó imagen en la respuesta");
  } catch (error: unknown) {
    console.error("Gemini API error:", sanitizeForLogging(error));
    throw toUserFacingError(error, model);
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

const MAX_PROMPT_LENGTH = 500;

export async function modifyImage(
  originalImage: string,
  currentResultImage: string,
  userPrompt: string
): Promise<string> {
  const model = getModel();
  const trimmedPrompt = userPrompt.trim().slice(0, MAX_PROMPT_LENGTH);

  const originalMatches = originalImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!originalMatches) throw new Error("Formato de imagen original no válido.");

  const currentMatches = currentResultImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!currentMatches) throw new Error("Formato de imagen resultado no válido.");

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: originalMatches[1], data: originalMatches[2] } },
            { inlineData: { mimeType: currentMatches[1], data: currentMatches[2] } },
            { text: `${MODIFICATION_CONTEXT_PROMPT} ${trimmedPrompt}` },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No se generó respuesta del modelo de IA");

    for (const part of parts) {
      if (part.inlineData?.data) {
        const outputMimeType = part.inlineData.mimeType || "image/png";
        return `data:${outputMimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No se generó imagen en la respuesta");
  } catch (error: unknown) {
    console.error("Gemini API error:", sanitizeForLogging(error));
    throw toUserFacingError(error, model);
  }
}
