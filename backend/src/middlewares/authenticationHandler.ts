import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const mockAuthMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  const token = tokenParts[1];
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      // This will catch expired tokens, invalid signatures, etc.
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    (req as any).user = user;
    next();
  });
};
