import { Router } from "express";
import multer from "multer";
import paths from "../config/paths";
import { mockAuthMiddleware } from "../middlewares/authenticationHandler";
import {
  uploadFileHandler,
  deleteFileHandler,
} from "../controllers/fileController";

const router = Router();
const upload = multer({ dest: paths.uploads });

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

// Protect all chat routes with mockAuthMiddleware
router.use(mockAuthMiddleware);

router.post("/upload", upload.single("file"), asyncHandler(uploadFileHandler));
router.post("/delete", asyncHandler(deleteFileHandler));

export default router;
