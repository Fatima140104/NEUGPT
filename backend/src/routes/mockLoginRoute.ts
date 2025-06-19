//TODO: use a real login route
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", (req: any, res: any) => {
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

  // Sign a token
  const token = jwt.sign(user, "dev-secret", { expiresIn: "1h" });
  res.json({ token });
});

export default router;
