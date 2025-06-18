import Session from "../models/session";
import { Request, Response, NextFunction } from "express";

// TODO: Thực thi authentication method
const userId = "684c02e9d5d8bf6606007121";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    res.json({ message: "Session deleted" });
  } catch (err) {
    next(err);
  }
};
