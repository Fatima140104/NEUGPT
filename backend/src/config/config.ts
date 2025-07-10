import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  openaiApiKey: string;
  frontendUrl: string;
  backendUrl: string;
  microsoft: {
    clientId: string;
    tenantId: string;
    clientSecret: string;
    redirectUri: string;
  };
  jwtSecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "",
  mongoUri: process.env.MONGODB_URI || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "",
  backendUrl: process.env.BACKEND_URL || "",
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || "",
    tenantId: process.env.MICROSOFT_TENANT_ID || "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || "",
  },
  jwtSecret: process.env.JWT_SECRET || "",
};

export default config;
