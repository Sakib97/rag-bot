import { GoogleGenAI } from "@google/genai";

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAnswer = async (prompt) => {
    const response = await googleGenAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    return response.text;

//   const interaction = await googleGenAI.interactions.create({
//     model: "gemini-3.1-flash-lite",
//     input: prompt,
//   });

//   return interaction.output.content.text;
};
