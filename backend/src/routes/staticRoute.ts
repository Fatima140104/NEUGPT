/*
 * This route is used to serve static files from the uploads directory.
 * It is used to serve files that are uploaded by the user.
 * It is not protected by the mockAuthMiddleware.
 */

import { Router } from "express";
// import { getFilesByIds } from "../controllers/fileController";
import path from "path";
import express from "express";
import paths from "../config/paths";

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

const router = Router();

// router.get("/", asyncHandler(getFilesByIds));

router.use("/:userId", (req, res, next) => {
  const userId = req.params.userId;
  const userUploadPath = path.join(paths.uploads, userId);
  express.static(userUploadPath)(req, res, next);
});
export default router;
