import { Router } from "express";
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  getChatsBySession,
} from "../controllers/chatController";

const router = Router();

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

router.get("/", asyncHandler(getChats));
router.get("/:id", asyncHandler(getChatById));
router.get("/session/:sessionId", asyncHandler(getChatsBySession));
router.post("/", asyncHandler(createChat));
router.put("/:id", asyncHandler(updateChat));
router.delete("/:id", asyncHandler(deleteChat));

export default router;
