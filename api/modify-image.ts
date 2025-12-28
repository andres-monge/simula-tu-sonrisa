import { modifyImage } from "../server/gemini";
import { sanitizeForLogging } from "../server/logger";

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
      userPrompt.trim(),
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ modifiedImage });
  } catch (error: any) {
    console.error("Modify image error:", sanitizeForLogging(error));
    return res.status(500).json({
      error: error?.message || "Failed to modify image",
    });
  }
}


