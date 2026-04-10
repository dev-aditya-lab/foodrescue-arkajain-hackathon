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
