// run this file
// node src/services/embeddingService.js

// pipeline() loads and runs a model.
// env lets us configure where models are cached and how they are loaded.
import { env, pipeline } from "@huggingface/transformers";
import { log } from "console";
import path from "path";

// Store downloaded model files inside the project .models-cache folder.
env.cacheDir = path.resolve(process.cwd(), ".models-cache");

// Print the cache directory in console.
// log(`Cache directory: ${env.cacheDir}`);

// We allow the first run to download the model.
// After downloading, cached files are reused.
env.allowRemoteModels = true;

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

// Loading a model can take time. We do not want to load the model every time someone asks a question.
// So we load the model once and store it in a promise.

// Bad approach:
// Question 1 → Load model → Embed → Answer
// Question 2 → Load model → Embed → Answer
// Question 3 → Load model → Embed → Answer

// Good approach:
// Server starts → First embedding request → Load model once →
// Keep it in memory → Question 2 → Reuse model → Question 3 → Reuse model

let extractorPromise = null;

// Load the model only once.
const getExtractor = async () => {
  // If the model is not already loaded, load it.
  if (!extractorPromise) {
    console.log("Loading local embedding model...");

    // feature-extraction Loads the model for converting input text
    // into a 384-dimensional embedding vector.
    extractorPromise = pipeline("feature-extraction", MODEL_NAME);

    await extractorPromise;

    console.log("Local embedding model is ready.");
  }

  return extractorPromise;
};

// Convert one text into a 384-dimensional embedding.
export const generateEmbedding = async (text) => {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  //   The model returns a tensor.
  //   We convert it to a JavaScript array.
  //   This is the embedding vector.
  return Array.from(output.data);
};
