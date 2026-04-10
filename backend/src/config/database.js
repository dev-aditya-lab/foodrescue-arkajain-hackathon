import mongoose from "mongoose";
import { DATABASE_URL } from "./env.config.js";

let cachedConnection = null;
let cachedConnectPromise = null;

async function connectToDatabase() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (cachedConnectPromise) {
    await cachedConnectPromise;
    return cachedConnection;
  }

  cachedConnectPromise = mongoose
    .connect(DATABASE_URL)
    .then((connection) => {
      cachedConnection = connection;
      return connection;
    })
    .finally(() => {
      cachedConnectPromise = null;
    });

  await cachedConnectPromise;
  return cachedConnection;
}

export default connectToDatabase;
