import mongoose from "mongoose";
import config from "../config/config";

export async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}