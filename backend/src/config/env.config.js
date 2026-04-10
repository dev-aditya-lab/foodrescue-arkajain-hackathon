// env configuration file
import dotenv from "dotenv";
dotenv.config();

const requiredEnvVar = (varName) => {
  if (!process.env[varName]) {
    throw new Error(`${varName} is not defined in .env file or its value is empty`);
  }
  return process.env[varName];
};

export const PORT = requiredEnvVar("PORT");
export const JWT_SECRET = requiredEnvVar("JWT_SECRET");
export const DATABASE_URL = requiredEnvVar("DATABASE_URL");
export const FRONTEND_URL = requiredEnvVar("FRONTEND_URL");
export const CLOUDINARY_CLOUD_NAME = requiredEnvVar("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = requiredEnvVar("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = requiredEnvVar("CLOUDINARY_API_SECRET");
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "food-rescue";
