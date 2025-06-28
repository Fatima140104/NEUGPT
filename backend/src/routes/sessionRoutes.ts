import { Router } from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  updateSessionTitle,
} from "../controllers/sessionController";
import { mockAuthMiddleware } from "../middlewares/authenticationHandler";

const router = Router();

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

// Protect all session routes with mockAuthMiddleware
router.use(mockAuthMiddleware);

router.get("/", asyncHandler(getSessions));
router.get("/:id", asyncHandler(getSessionById));
router.post("/", asyncHandler(createSession));
router.put("/:id", asyncHandler(updateSession));
router.put("/:id/title", asyncHandler(updateSessionTitle));
router.delete("/:id", asyncHandler(deleteSession));

export default router;
