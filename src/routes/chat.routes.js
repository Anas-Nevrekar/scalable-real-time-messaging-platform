import express from "express";
import { createChat, listChats } from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, listChats);
router.post("/", authenticate, createChat);

export default router;