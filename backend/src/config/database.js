import mongoose from "mongoose";
import { DATABASE_URL } from "./env.config.js";

async function connectToDatabase() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  await mongoose.connect(DATABASE_URL);
  console.log("MongoDB connected successfully");
}

export default connectToDatabase;
