import { Router, Request, Response, NextFunction } from "express";
import { chatWithAI } from "../controllers/aiController";
import { mockAuthMiddleware } from "../middlewares/authenticationHandler";
import { abortAIRequest } from "../middlewares/abortControllers";
import { attachAbortController } from "../middlewares/abortMiddleware";

const router = Router();

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Protect all chat routes with mockAuthMiddleware
router.use(mockAuthMiddleware);

// Attach abort controller to streaming/chat route
router.post("/chat", attachAbortController, asyncHandler(chatWithAI));
router.post("/abort", asyncHandler(abortAIRequest));

export default router;
