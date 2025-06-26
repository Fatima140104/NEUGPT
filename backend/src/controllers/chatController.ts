import Chat from "../models/chat";
import { Request, Response, NextFunction } from "express";

export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chats = await Chat.find().populate("session").populate("user");
    res.json(chats);
  } catch (err) {
    next(err);
  }
};

export const getChatById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("session")
      .populate("user");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChatsBySession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const chats = await Chat.find({ session: sessionId })
      .sort({ timestamp: 1 })
      .populate("user");
    res.json(chats);
  } catch (err) {
    next(err);
  }
};

export const updateChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    next(err);
  }
};

export const deleteChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    next(err);
  }
};
