import app from "./app";
import config from "./config/config";
import { connectMongo } from "./database/mongo";

connectMongo();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});