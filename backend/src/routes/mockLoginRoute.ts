//TODO: use a real login route
import { Router } from "express";
import { mockLogin } from "../controllers/authController";

const router = Router();

router.post("/", mockLogin);

export default router;
