import express from "express";
import { answerQuestion } from "../services/ragService.js";

const router = express.Router();


// test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Question routes are working" });
});

router.post("/answer", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const answer = await answerQuestion(question);
    res.status(200).json(answer);
  } catch (error) {
    console.error("Error answering question:", error);
    res.status(500).json({
      message: "Failed to answer question",
      error: error.message,
    });
  }
});

export default router;