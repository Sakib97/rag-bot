import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const geminiEmbeddingModel = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const DIMENSIONS = parseInt(process.env.VECTOR_DIMENSIONS_GEM);
if (isNaN(DIMENSIONS)) {
  throw new Error("VECTOR_DIMENSIONS_GEM is not set. Check .env file.");
}

export const generateEmbeddingGemini = async (text) => {
  const response = await geminiEmbeddingModel.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
    config: {
      outputDimensionality: DIMENSIONS,
    },
  });
  // return response.embeddings;

  // Normalize: truncated Matryoshka vectors aren't guaranteed unit-length
  // The normalization step matters if your Atlas index uses dotProduct. With cosine it doesn't, but it costs nothing to keep.
  const v = response.embeddings[0].values;
  const norm = Math.hypot(...v);
  return v.map((x) => x / norm);
};
