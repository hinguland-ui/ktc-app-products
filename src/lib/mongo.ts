import mongoose from "mongoose";
import { logger } from "./logger.js";

let connected = false;

export async function connectMongo() {
  if (connected) return;
  const uri = process.env["MONGO_URL"];
  if (!uri) {
    logger.warn("MONGO_URL not set — MongoDB features disabled");
    return;
  }
  try {
    await mongoose.connect(uri);
    connected = true;
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
  }
}

export { mongoose };
