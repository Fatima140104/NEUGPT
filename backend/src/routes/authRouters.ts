import { Router, Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";
import { microsoftCallback, microsoftLogin } from "../controllers/authController";
dotenv.config();

const router = Router();


router.get("/auth/microsoft", microsoftLogin);

router.get("/auth/callback/azure-ad", async (req, res) => {
  await microsoftCallback(req, res);
});


export default router;
