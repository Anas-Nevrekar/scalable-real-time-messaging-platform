import express from "express";
import { searchUsersController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", authenticate, searchUsersController);

export default router;