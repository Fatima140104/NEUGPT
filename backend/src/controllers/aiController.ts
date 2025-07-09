import { Request, Response } from "express";
import Chat from "../models/chat";
import Session from "../models/session";
import { OpenAI } from "openai";
import dotenv from "../config/config";
import {
  isModelValid,
  getModelById,
  getDefaultModel,
  getAvailableModels,
} from "../config/models";
import File from "../models/file";
import { Types } from "mongoose";
import fs from "fs/promises";

const openai = new OpenAI({ apiKey: dotenv.openaiApiKey });

// Function để generate title từ AI
const generateSessionTitle = async (message: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: getDefaultModel().id,
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps generate concise conversation titles. Create a short title (no more than 30 characters) based on the user's first message. Return only the title, no explanations. The title should be in the same language as the user's message (english or vietnamese).",
        },
        {
          role: "user",
          content: `Create a title for the conversation starting with the message: "${message}"`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    let title =
      completion.choices[0]?.message?.content?.trim() ||
      message.substring(0, 30);

    // Loại bỏ dấu ngoặc kép ở đầu và cuối nếu có
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }
    if (title.startsWith("'") && title.endsWith("'")) {
      title = title.slice(1, -1);
    }

    return title.trim();
  } catch (error) {
    //
    console.error("Error generating session title:", error);
    // Fallback: sử dụng 30 ký tự đầu của message
    return message.length > 30 ? message.substring(0, 30) + "..." : message;
  }
};

// Function để update session title (chạy background)
const updateSessionTitleAsync = async (
  sessionId: string,
  message: string
): Promise<void> => {
  try {
    const title = await generateSessionTitle(message);
    await Session.findByIdAndUpdate(sessionId, { title });
    console.log(`Session ${sessionId} title updated: ${title}`);
  } catch (error) {
    console.error(`Failed to update session ${sessionId} title:`, error);
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  //Extract and validate request data
  const userId = (req as any).user?.id;
  const { sessionId, message, model: requestedModel, file_ids } = req.body;
  // Get files from database
  const files = await File.find({ _id: { $in: file_ids } });
  console.log(files);
  // Map file type to openai type
  const fileTypeMap = {
    image: "image_url",
    raw: "input_file",
  };

  // Map to a simple array of file info
  const fileInfos = files.map((file) => ({
    url: file.filepath,
    type: fileTypeMap[file.type as keyof typeof fileTypeMap],
    filename: file.filename,
    local_path: file.local_path,
    _id: file._id,
  }));

  // Validate required fields
  if (!sessionId) {
    res.status(400).write("event: error\ndata: sessionId is required\n\n");
    return res.end();
  }
  if (!message) {
    res.status(400).write("event: error\ndata: Message is required\n\n");
    return res.end();
  }
  if (!userId) {
    res.status(401).write("event: error\ndata: User not authenticated\n\n");
    return res.end();
  }

  // Model selection and validation
  let selectedModel = requestedModel;
  if (!selectedModel) {
    selectedModel = getDefaultModel().id;
  } else {
    if (!isModelValid(selectedModel)) {
      const modelInfo = getModelById(selectedModel);
      if (!modelInfo) {
        res
          .status(400)
          .write(
            `event: error\ndata: Invalid model: ${selectedModel}. Model not found.\n\n`
          );
        return res.end();
      } else if (!modelInfo.isAvailable) {
        res
          .status(400)
          .write(
            `event: error\ndata: Model ${selectedModel} is currently not available.\n\n`
          );
        return res.end();
      }
    }
  }

  // Set up SSE response headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  try {
    // Store user message and trigger session title generation if first message
    const existingChats = await Chat.find({ session: sessionId });
    const isFirstMessage = existingChats.length === 0;

    // Save the user message
    await Chat.create({
      session: sessionId,
      user: userId,
      role: "user",
      content: message,
      timestamp: new Date(),
      files: file_ids,
    });

    if (isFirstMessage) {
      updateSessionTitleAsync(sessionId, message).catch((error) => {
        console.error("Background title generation failed:", error);
      });
    }

    // Retrieve chat history for context
    const chatHistory = await Chat.find({ session: sessionId })
      .sort({ timestamp: 1 })
      .select("role content");

    // Build content array for the user message
    const contentArray: any[] = [];
    if (message) {
      contentArray.push({ type: "text", text: message });
    }
    // Prepare file buffers for non-image files
    const fileBuffers: {
      filename: string;
      buffer: Buffer;
      path: string;
      dbId: any;
    }[] = [];
    for (const file of fileInfos) {
      if (file.type === "image_url") {
        contentArray.push({ type: "image_url", image_url: { url: file.url } });
      } else if (file.type === "input_file" && file.local_path) {
        // Read file data from disk using local_path
        const buffer = await fs.readFile(file.local_path);
        console.log("local_path", file.local_path);
        fileBuffers.push({
          filename: file.filename,
          buffer,
          path: file.local_path,
          dbId: file._id,
        });
        console.log("fileBuffers", fileBuffers);
        //TODO: Create assistant for uploading file to openai
        // contentArray.push({
        //   type: "file",
        //   file_data: buffer.toString("base64"),
        //   filename: file.filename,
        // });
      }
    }

    // Build the messages array in multimodal format
    const messages = [
      ...chatHistory.map((chat) => ({
        role: chat.role,
        content: [{ type: "text", text: chat.content }],
      })),
      {
        role: "user",
        content: contentArray,
      },
    ];
    // Call OpenAI API and stream response to client
    // TODO: Add toast to show error message (rate limit, etc)
    let fullContent = "";
    try {
      const completion = await openai.chat.completions.create(
        {
          model: selectedModel,
          messages: messages as any,
          stream: true,
        },
        { signal: (req as any).abortSignal }
      );
      for await (const chunk of completion) {
        const content = chunk.choices?.[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify(content)}\n\n`);
        }
      }
    } finally {
      // Delete files after reading and sending to OpenAI, and remove local_path from DB
      console.log("finally");
      for (const { path, dbId } of fileBuffers) {
        console.log("fileBuffers", fileBuffers);
        if (path) {
          try {
            await fs.unlink(path);
          } catch (e) {
            /* log or ignore */
          }
        }
        try {
          await File.findByIdAndUpdate(dbId, { $unset: { local_path: "" } });
        } catch (e) {
          /* log or ignore */
        }
      }
    }

    // Store assistant message after streaming is done
    await Chat.create({
      session: sessionId,
      user: userId,
      role: "assistant",
      content: fullContent,
      timestamp: new Date(),
      files: file_ids || [],
    });

    res.write("event: end\ndata: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    // Error handling: stream error event to client
    console.error("Streaming chat error:", err);
    res.write(`event: error\ndata: ${JSON.stringify(err?.message || err)}\n\n`);
    res.end();
  }
};
