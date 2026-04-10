import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import { PORT } from "./src/config/env.config.js";
import connectToDatabase from "./src/config/database.js";

async function bootstrapServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

bootstrapServer();