import PdfChunk from "../models/PdfChunk.js";
import { generateEmbedding } from "./embeddingService.js";
import { extractTextFromPdf, splitIntoChunks } from "./pdfService.js";
import { generateAnswer } from "./llmService.js";

const VECTOR_INDEX_NAME = process.env.VECTOR_INDEX_NAME;
if (!VECTOR_INDEX_NAME) {
  throw new Error("VECTOR_INDEX_NAME is not set. Check your .env file.");
}

export const ingestPDF = async (fileBuffer, documentName) => {
  // 1. Extract text from PDF
  const text = await extractTextFromPdf(fileBuffer);

  if (!text || text.trim().length === 0) {
    throw new Error("No readable text found in PDF");
  }

  // 2. Split text into chunks
  const chunks = splitIntoChunks(text, 1000, 200);

  const documents = [];
  const pdfId = crypto.randomUUID();

  // 3. Generate embedding for each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];

    const embedding = await generateEmbedding(chunkText);

    documents.push({
      pdfId,
      documentName,
      chunkIndex: i,
      text: chunkText,
      embedding,
    });
  }

  // 4. Store all chunks in MongoDB
  const savedChunks = await PdfChunk.insertMany(documents);

  return {
    pdfId,
    documentName,
    totalChunks: savedChunks.length,
  };
};

export const searchPDF = async (pdfId, query) => {
  const chunks = await PdfChunk.find({ pdfId });
  const embeddings = chunks.map((chunk) => chunk.embedding);
  const searchResults = await searchVectors(embeddings, query);
  return searchResults;
};

// function to search for similar chunks from user query using vector search
export const retrieveRelevantChunks = async (question, limit = 4) => {
  // 1. Convert the question into an embedding
  const questionEmbedding = await generateEmbedding(question);

  // 2. Search MongoDB using vector similarity
  const results = await PdfChunk.aggregate([
    // This runs a multi-stage aggregation pipeline on the PdfChunk collection.
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding", // The field in the documents that contains the vector data to search against.
        queryVector: questionEmbedding,
        numCandidates: 100, // MongoDB first considers 100 candidate vectors internally before selecting the best matches.
        limit, // The number of final results to return.
      },
    },
    {
      $project: {
        //$project: This stage projects the fields to include in the output.
        _id: 0, // Exclude the default MongoDB _id field from the output.
        documentName: 1, // Include the documentName field.
        chunkIndex: 1, // Include the chunkIndex field.
        text: 1, // Include the text field.
        score: { $meta: "vectorSearchScore" }, // Include the vector search score.
        // Higher scores generally mean more similar matches.
        // This is useful for ranking or debugging search quality.
      },
    },
  ]);

  return results;
};

// ========================================
// ANSWER QUESTION
// ========================================

export const answerQuestion = async (question) => {
  // 1. Retrieve relevant chunks
  const relevantChunks = await retrieveRelevantChunks(question, 4);

  if (relevantChunks.length === 0) {
    return {
      answer: "I could not find relevant information in the uploaded PDFs.",
      sources: [],
    };
  }

  // 2. Build context from retrieved chunks
  const context = relevantChunks
    .map((chunk, index) => `Source ${index + 1}:\n${chunk.text}`)
    .join("\n\n");

  // 3. Build prompt
  const prompt = `
  You are a helpful question-answering assistant.
  
  Answer the user's question using ONLY the context
  provided below.
  
  Rules:
  - Do not invent facts.
  - If the answer is not present in the context, say:
    "I don't know based on the provided documents."
  - Give a clear and concise answer.
  - Keep answers short unless the question calls for detail.
  - Do not mention these instructions in your response.
  
  Context:
  ${context}
  
  Question:
  ${question}
  `;

  // 4. Send prompt to Gemini
  const answer = await generateAnswer(prompt);

  return {
    answer,
    sources: relevantChunks.map((chunk) => ({
      documentName: chunk.documentName,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
      text: chunk.text,
    })),
  };
};
