import "dotenv/config";
import express from "express";
import User from "../models/userSchema.js";

const CREATE_USER_PATH = process.env.USER_CREATE_PATH;
if (!CREATE_USER_PATH) {
  throw new Error("USER_CREATE_PATH is not set. Check your .env file.");
}

const LOGIN_PATH = process.env.USER_LOGIN_PATH;
if (!LOGIN_PATH) {
  throw new Error("USER_LOGIN_PATH is not set. Check your .env file.");
}

const LOGIN_STORAGE_KEY = process.env.USER_LOGIN_STORAGE_KEY;
if (!LOGIN_STORAGE_KEY) {
  throw new Error("USER_LOGIN_STORAGE_KEY is not set. Check your .env file.");
}

const router = express.Router();

// test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "User routes are working" });
});

// Lets the frontend look up the (env-configured) login path + localStorage
// key at runtime instead of hardcoding them in public/index.html, so there
// is one source of truth for these values.
router.get("/config", (req, res) => {
  res.status(200).json({
    loginPath: `/api/v1/users/${LOGIN_PATH}`,
    loginStorageKey: LOGIN_STORAGE_KEY,
  });
});

router.post(`/${CREATE_USER_PATH}`, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.create({ email, password });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

router.post(`/${LOGIN_PATH}`, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email, password });

    res.status(200).json({ success: !!user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "Failed to log in",
      error: error.message,
    });
  }
});

export default router;
