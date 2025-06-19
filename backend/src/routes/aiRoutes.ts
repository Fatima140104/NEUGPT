import { Router, Request, Response, NextFunction } from "express";
import { chatWithAI } from "../controllers/aiController";
import { mockAuthMiddleware } from "../middlewares/authenticationHandler";

const router = Router();

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Protect all chat routes with mockAuthMiddleware
router.use(mockAuthMiddleware);

router.post("/", asyncHandler(chatWithAI));

export default router;
