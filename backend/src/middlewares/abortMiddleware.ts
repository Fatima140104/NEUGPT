import { Request, Response, NextFunction } from "express";
import { setAbortController, deleteAbortController } from "./abortControllers";

interface UserRequest extends Request {
  user?: { id: string };
}

export function attachAbortController(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  const abortController = new AbortController();
  const key =
    (req.body?.sessionId as string) ||
    (req.body?.abortKey as string) ||
    (req.user && req.user.id);

  if (key) {
    setAbortController(key, abortController);
  }

  res.on("finish", () => {
    if (key) {
      deleteAbortController(key);
    }
  });

  (req as any).abortController = abortController;
  (req as any).abortSignal = abortController.signal;

  next();
}
