import express from "express";
import { PdfChunkGem } from "../models/PdfChunk.js";

const router = express.Router();

// test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "PDF routes are working" });
});

// Many chunks share the same documentName (one per PDF page/section), so
// distinct() collapses them to the unique set instead of returning duplicates.
router.get("/getUniqueDocNames", async (req, res) => {
  try {
    const documentNames = await PdfChunkGem.distinct("documentName");

    res.status(200).json({ documentNames });
  } catch (error) {
    console.error("Error fetching document names:", error);
    res.status(500).json({
      message: "Failed to fetch document names",
      error: error.message,
    });
  }
});

export default router;
