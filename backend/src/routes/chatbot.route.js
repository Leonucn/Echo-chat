import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  updateChatbotConfig,
  createChatbot,
  getAllChatbots,
  deleteChatbot,
} from "../controllers/chatbot.controller.js";

const router = express.Router();

// CRUD routes
router.post("/", protectRoute, createChatbot);
router.get("/", protectRoute, getAllChatbots);
router.put("/:id", protectRoute, updateChatbotConfig);
router.delete("/:id", protectRoute, deleteChatbot);

export default router;
