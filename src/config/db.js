import "dotenv/config";
import mongoose from "mongoose";

const DB_NAME = process.env.MONGODB_DB || "rag_bot";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Check your .env file.");
  }

  await mongoose.connect(uri, { dbName: DB_NAME });
  console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);

  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("Closed connection to MongoDB");
};
