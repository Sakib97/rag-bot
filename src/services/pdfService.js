import { extractText, getDocumentProxy } from "unpdf";


export const extractTextFromPdf = async (buffer) => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  return text;
};

/**
 * Splits raw PDF text into overlapping chunks.
 *
 * Why chunk: an embedding compresses a whole passage into one vector, so
 * a 40-page document as a single vector is useless - everything looks equally
 * similar to everything. Small chunks keep each vector "about" one thing.
 *
 * Why overlap: The overlap helps prevent important context from
 * being cut between chunks.
 * Carrying the last 200 characters forward covers the flow of the text.
 * 
 * Chunk 1: characters 0 → 1000
 * Chunk 2: characters 800 → 1800
 * Chunk 3: characters 1600 → 2600
 *
 * This is a simple character-based splitter.
 * It is good for learning, though a production application
 * would usually use token-aware or paragraph-aware chunking.
 */
export const splitIntoChunks = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
};
