import express from "express";
import { createChat } from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createChat);

export default router;