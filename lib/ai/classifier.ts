import OpenAI from "openai";
import type { DocumentCategory } from "@/types/document";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const classifierModel = process.env.OPENAI_MODEL_CLASSIFIER || "gpt-4o-mini";

function normalizeCategory(value: string): DocumentCategory {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("agreement")) return "agreement";
  if (normalized.includes("legal")) return "legal";
  return "other";
}

export async function classifyDocument(fileBuffer: Buffer): Promise<DocumentCategory> {
  if (!openai) return "other";

  const textSample = fileBuffer.toString("utf-8").replace(/\0/g, "").slice(0, 5000);
  if (!textSample || textSample.length < 40) return "other";

  const response = await openai.responses.create({
    model: classifierModel,
    input: [
      {
        role: "system",
        content:
          "Classifique o documento em exatamente uma categoria: contract, agreement, legal ou other. Responda apenas a categoria."
      },
      { role: "user", content: textSample }
    ]
  });

  return normalizeCategory(response.output_text || "other");
}
