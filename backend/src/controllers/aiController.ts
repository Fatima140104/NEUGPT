import { Request, Response } from "express";
import Chat from "../models/chat";
import { OpenAI } from "openai";
import config from "../config/config";
import { isModelValid, getModelById, getDefaultModel, getAvailableModels } from "../config/models";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export const chatWithAI = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const sessionId = req.body.sessionId || "";
  const { message, model: requestedModel } = req.body;

  // Validate basic requirements
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // Validate and set model
  let selectedModel = requestedModel;
  
  // Use default model if no model specified
  if (!selectedModel) {
    selectedModel = getDefaultModel().id;
    console.log(`No model specified, using default: ${selectedModel}`);
  } else {
    // Validate the requested model
    if (!isModelValid(selectedModel)) {
      const modelInfo = getModelById(selectedModel);
      if (!modelInfo) {
        return res.status(400).json({ 
          error: `Invalid model: ${selectedModel}. Model not found.` 
        });
      } else if (!modelInfo.isAvailable) {
        return res.status(400).json({ 
          error: `Model ${selectedModel} is currently not available.` 
        });
      }
    }
    // console.log(`Using requested model: ${selectedModel}`);
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
      model: selectedModel,
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
