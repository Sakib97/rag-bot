import mongoose from "mongoose";

/**
 *
 * @param {string} documentName - The name of the document.
 * @param {number} chunkIndex - The index of the chunk.
 * @param {string} text - The text of the chunk.
 * @param {number[]} embedding - The embedding of the chunk.
 */

const pdfChunkSchema = new mongoose.Schema(
  {
    pdfId: {
      type: String,
      // ref: "Pdf",
      required: true,
    },
    documentName: {
      type: String,
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PdfChunk = mongoose.model("PdfChunk", pdfChunkSchema); // mongo will create a collection named pdfchunks
export default PdfChunk;
