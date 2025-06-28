import { Request, Response } from "express";

export const abortAIRequest = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const sessionId = req.body?.sessionId as string;
  const abortKey = req.body?.abortKey as string;
  const key = sessionId || abortKey || userId;

  if (!key) {
    return res.status(400).json({ message: "No key provided" });
  }
  const controller = getAbortController(key);
  if (controller) {
    controller.abort();
    deleteAbortController(key);
    return res.status(200).json({ message: "Aborted" });
  }
  res.status(404).json({ message: "No active request found" });
};

const abortControllers: Map<string, AbortController> = new Map();

export function setAbortController(key: string, controller: AbortController) {
  abortControllers.set(key, controller);
}

export function getAbortController(key: string): AbortController | undefined {
  return abortControllers.get(key);
}

export function deleteAbortController(key: string) {
  abortControllers.delete(key);
}

export { abortControllers };
