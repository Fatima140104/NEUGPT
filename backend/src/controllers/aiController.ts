import { Request, Response } from "express";
import Chat from "../models/chat";
import { OpenAI } from "openai";
import config from "../config/config";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export const chatWithAI = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const sessionId = req.body.sessionId || "";
  const { message } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Store user message
    await Chat.create({
      session: sessionId,
      user: userId,
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });
    const aiContent = completion.choices[0]?.message?.content || "";

    // Store assistant message
    await Chat.create({
      session: sessionId,
      user: userId,
      role: "assistant",
      content: aiContent,
      timestamp: new Date(),
    });

    res.json({ ChatResponse: aiContent });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to get AI response or store messages" });
  }
};
