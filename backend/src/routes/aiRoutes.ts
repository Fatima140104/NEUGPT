import { Router, Request, Response, NextFunction } from "express";
import axios from "axios";

const router = Router();

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/chat",
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Thay bằng user/session từ authentication khi có
    const userId = req.body.userId || "mockUserId";
    const sessionId = req.body.sessionId || "mockSessionId";
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const openaiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
      res.json({ ChatResponse: openaiRes.data.choices[0].message.content });
    } catch (err) {
      res.status(500).json({ error: "Failed to get AI response" });
    }
  })
);

export default router;
