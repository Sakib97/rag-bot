/***
 * starts the server, listens for incoming requests,
 * and handles termination signals.
 * ***/

import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await disconnectDB();
      console.log("Server closed");
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
