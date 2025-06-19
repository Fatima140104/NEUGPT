import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const mockAuthMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "dev-secret", (err, user) => {
    if (err) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    (req as any).user = user;
    next();
  });
};
