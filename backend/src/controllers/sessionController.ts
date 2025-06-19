import Session from "../models/session";
import Chat from "../models/chat";
import { Request, Response, NextFunction } from "express";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    const session = await Session.create({
      ...req.body,
      user: userId,
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    const sessions = await Session.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

export const getSessionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findById(req.params.id).populate("user");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    // Delete all chat messages with this session id
    await Chat.deleteMany({ session: req.params.id });
    res.json({ message: "Session and associated chats deleted" });
  } catch (err) {
    next(err);
  }
};
