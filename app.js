/***
 * creates the Express instance,
 * registers middleware, mounts routes, sets up error handling,
 * then exports the app.
 *  ***/
import express from "express";

// import routes
import ingestRoutes from "./src/routes/ingestRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import pdfRoutes from "./src/routes/pdfRoutes.js";
const app = express();

// global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files
app.use(express.static("public"));


// sample route
app.get("/", (req, res) => {
  res.send("Hello World !!");
});

// mount routes
app.use("/api/v1/ingest", ingestRoutes);
app.use("/api/v1/question", questionRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pdf", pdfRoutes);

// error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

export default app;
