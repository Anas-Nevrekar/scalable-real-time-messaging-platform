import express from "express";
import { getHistory } from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:chatId", authenticate, getHistory);

export default router;