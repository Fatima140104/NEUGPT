import { Router, Request, Response, NextFunction } from "express";
import { OpenAI } from "openai";
import Chat from "../models/chat";
import config from "../config/config";

const router = Router();

const openai = new OpenAI({ apiKey: config.openaiApiKey });

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/chat",
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Thực thi authentication method
    const userId = "684c02e9d5d8bf6606007121";
    const sessionId = req.body.sessionId || "mockSessionId";
    const { message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
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
  })
);

export default router;
