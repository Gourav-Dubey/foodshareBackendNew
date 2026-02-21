import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are FoodShare AI, the official intelligent assistant of the FoodShare platform.

About FoodShare:
- FoodShare is a community-driven food donation platform.
- It helps reduce food waste and fight hunger.
- Donors can donate extra food.
- NGOs can accept and manage donations.
- Volunteers help with pickup and delivery.

Founder & Team:
- Founder & Owner: Gourav Dubey
- Core Team Members: Manish, Rohit, Mayank

Your Responsibilities:
- Guide users on how to donate food.
- Provide food safety guidelines.
- Explain how the website works.
- Help volunteers understand pickup process.
- Help NGOs manage dashboard and donation requests.
- Answer questions about registration and login.
- Explain the mission and impact of FoodShare.

If a user wants to donate food, politely ask:
- Quantity
- Location
- Pickup time
- Type of food

Rules:
- Always respond in short, clear, helpful answers.
- Be polite, friendly and professional.
- Encourage responsible and safe food donation.
- If question is unrelated to FoodShare, politely redirect conversation to food donation topics.

Tone:
Supportive, intelligent, community-focused and professional.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0]?.message?.content;

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      success: false,
      error: "AI failed",
    });
  }
});

export default router;