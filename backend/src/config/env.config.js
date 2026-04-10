// env configuration file
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || console.log("PORT is not defined in .env file");
export const JWT_SECRET = process.env.JWT_SECRET || console.log("JWT_SECRET is not defined in .env file");
export const DATABASE_URL = process.env.DATABASE_URL || console.log("DATABASE_URL is not defined in .env file");
export const FRONTEND_URL = process.env.FRONTEND_URL || console.log("FRONTEND_URL is not defined in .env file");
