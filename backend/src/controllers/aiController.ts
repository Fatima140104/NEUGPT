import { Request, Response } from "express";
import Chat from "../models/chat";
import Session from "../models/session";
import { OpenAI } from "openai";
import config from "../config/config";
import { isModelValid, getModelById, getDefaultModel, getAvailableModels } from "../config/models";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Function để generate title từ AI
const generateSessionTitle = async (message: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps generate concise conversation titles. Create a short title (no more than 30 characters) based on the user's first message. Return only the title, no explanations. The title should be in the same language as the user's message (english or vietnamese)."
        },
        {
          role: "user",
          content: `Create a title for the conversation starting with the message: "${message}"`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    let title = completion.choices[0]?.message?.content?.trim() || message.substring(0, 30);
    
    // Loại bỏ dấu ngoặc kép ở đầu và cuối nếu có
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }
    if (title.startsWith("'") && title.endsWith("'")) {
      title = title.slice(1, -1);
    }
    
    return title.trim();
  } catch (error) {
    console.error("Error generating session title:", error);
    // Fallback: sử dụng 30 ký tự đầu của message
    return message.length > 30 ? message.substring(0, 30) + "..." : message;
  }
};

// Function để update session title (chạy background)
const updateSessionTitleAsync = async (sessionId: string, message: string): Promise<void> => {
  try {
    const title = await generateSessionTitle(message);
    await Session.findByIdAndUpdate(sessionId, { title });
    console.log(`Session ${sessionId} title updated: ${title}`);
  } catch (error) {
    console.error(`Failed to update session ${sessionId} title:`, error);
  }
};

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
    // Kiểm tra xem đây có phải tin nhắn đầu tiên không
    const existingChats = await Chat.find({ session: sessionId });
    const isFirstMessage = existingChats.length === 0;

    // Store user message
    await Chat.create({
      session: sessionId,
      user: userId,
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Nếu là tin nhắn đầu tiên, bắt đầu generate title song song
    if (isFirstMessage) {
      // Chạy generate title ở background, không đợi kết quả
      updateSessionTitleAsync(sessionId, message).catch(error => {
        console.error("Background title generation failed:", error);
      });
    }

    // Lấy lịch sử chat 10 tin nhắn gần nhất để có context
    const chatHistory = await Chat.find({ session: sessionId })
      .sort({ timestamp: 1 })
      .limit(10)
      .select('role content');

    // Tạo messages array với system prompt và lịch sử
    const messages: any[] = [];

    // Thêm lịch sử chat (bao gồm tin nhắn vừa lưu)
    chatHistory.forEach(chat => {
      messages.push({
        role: chat.role,
        content: chat.content
      });
    });

    // Call OpenAI API cho response chính
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages,
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
    console.error("Chat error:", err);
    res
      .status(500)
      .json({ error: "Failed to get AI response or store messages" });
  }
};
