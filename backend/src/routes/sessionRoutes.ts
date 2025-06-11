import { Router } from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionsByUser,
} from "../controllers/sessionController";

const router = Router();

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

router.get("/", asyncHandler(getSessions));
router.get("/:id", asyncHandler(getSessionById));
router.get("/user/:userId", asyncHandler(getSessionsByUser));
router.post("/", asyncHandler(createSession));
router.put("/:id", asyncHandler(updateSession));
router.delete("/:id", asyncHandler(deleteSession));

export default router;
