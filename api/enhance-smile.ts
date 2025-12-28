import { enhanceSmile } from "./lib/gemini";

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
    return res.status(500).json({
      error: error?.message || "Failed to process image",
    });
  }
}


