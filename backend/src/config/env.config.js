// env configuration file
import dotenv from "dotenv";
dotenv.config();

const requiredEnvVar = (varName) => {
  if (!process.env[varName]) {
    throw new Error(`${varName} is not defined in .env file or its value is empty`);
  }
  return process.env[varName];
};

const normalizeOrigin = (value) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "");

export const PORT = requiredEnvVar("PORT");
export const JWT_SECRET = requiredEnvVar("JWT_SECRET");
export const DATABASE_URL = requiredEnvVar("DATABASE_URL").trim();
export const FRONTEND_URL = normalizeOrigin(requiredEnvVar("FRONTEND_URL"));
export const FRONTEND_ORIGINS = Array.from(
  new Set(
    [
      FRONTEND_URL,
      ...String(process.env.FRONTEND_URLS || "")
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean),
    ].filter(Boolean)
  )
);
export const CLOUDINARY_CLOUD_NAME = requiredEnvVar("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = requiredEnvVar("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = requiredEnvVar("CLOUDINARY_API_SECRET");
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "food-rescue";
export const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || "";
export const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || "";
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || "noreply@devaditya.dev";
