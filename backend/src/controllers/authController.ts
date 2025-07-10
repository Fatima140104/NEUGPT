import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/user";
import config from "../config/config";

export const mockLogin = (req: Request, res: Response) => {
  // Dummy user payload
  const user = {
    id: "684c02e9d5d8bf6606007121",
    displayName: "kurumi",
    email: "kurumi@gmail.com",
    provider: "google",
    imageUrl:
      "https://res.cloudinary.com/dwt0m2nwq/image/upload/v1745251364/10_Sunshine_4k_v8w7ei.jpg",
    createdAt: "2025-06-13T10:52:25.071+00:00",
    updatedAt: "2025-06-13T10:52:25.071+00:00",
  };

  const token = jwt.sign(user, config.jwtSecret, { expiresIn: "1h" });
  res.json({ token });
};

export const microsoftLogin = (req: Request, res: Response) => {
  const url =
    `https://login.microsoftonline.com/${config.microsoft.tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${config.microsoft.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(config.microsoft.redirectUri)}` +
    `&response_mode=query` +
    `&scope=openid email profile`;
  res.redirect(url);
};

export const microsoftCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) return res.status(400).send("Missing authorization code");

  const tokenRes = await axios.post(
    `https://login.microsoftonline.com/${config.microsoft.tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: config.microsoft.clientId,
      client_secret: config.microsoft.clientSecret,
      code,
      redirect_uri: config.microsoft.redirectUri,
      grant_type: "authorization_code",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const decoded = jwt.decode(tokenRes.data.id_token) as {
    name: string;
    email: string;
  };

  const name = decoded.name;
  const email = decoded.email;
  
  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      email,
      displayName: name,
      provider: "azure-ad",
    });
  }
  
  const payload = {
    id: user._id,
    displayName: user.displayName,
    email: user.email,
    provider: user.provider,
  };
  
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
  
  res.redirect(`${config.frontendUrl}/auth/success?token=${token}`);
};