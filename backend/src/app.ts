import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import chatRoutes from "./routes/chatRoutes";
import aiRoutes from "./routes/aiRoutes";
//TODO: use a real login route
import mockLoginRoute from "./routes/mockLoginRoute";
import authRoutes from "./routes/authRouters";
import fileRoutes from "./routes/fileRoutes";
import paths from "./config/paths";
import staticRoute from "./routes/staticRoute";
import config from "./config/config";

const app = express();

app.locals.paths = paths;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [config.frontendUrl],
  credentials: true,
}));

app.use(morgan("dev"));

// Define routes
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/uploads", staticRoute);

app.use("/api/ai", aiRoutes);
app.use("/api/mock-login", mockLoginRoute);
app.use("/api", authRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to the Express API!");
});

export default app;
