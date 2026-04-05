import { config as dotenvConfig } from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenvConfig({ path: ".env.local" });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Set it in .env.local.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const pager = await ai.models.list();

  const models: any[] = [];
  for await (const model of pager as any) {
    models.push(model);
  }

  models.sort((a, b) => String(a?.name || a?.id).localeCompare(String(b?.name || b?.id)));

  for (const m of models) {
    const id = m?.name || m?.id || "[unknown-id]";
    const displayName = m?.displayName ? ` — ${m.displayName}` : "";
    console.log(`${id}${displayName}`);
  }

  console.log(`\nTotal models: ${models.length}`);
}

main().catch((err) => {
  console.error("Failed to list models:", err?.message || err);
  process.exitCode = 1;
});
