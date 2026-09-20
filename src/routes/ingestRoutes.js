import express from "express";
import { ingestPDF } from "../services/ragService.js";

// multer is a middleware for handling multipart/form-data,
// which is primarily used for uploading files.
import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // the uploaded PDF file is stored in memory rather than saving it to disk.
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Ingest routes are working" });
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Invalid file type" });
    }
    const result = await ingestPDF(req.file.buffer, req.file.originalname);

    res.status(201).json({
      message: "PDF ingested successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error ingesting PDF:", error);
    res.status(500).json({
      message: "Failed to ingest PDF",
      error: error.message,
    });
  }
});

export default router;
