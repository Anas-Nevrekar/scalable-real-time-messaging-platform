import { createOrGetDirectChat } from "../services/chat.service.js";

export const createChat = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (req.userId === otherUserId) {
      return res.status(400).json({
        message: "You cannot create a chat with yourself",
      });
    }

    const chat = await createOrGetDirectChat(
      req.userId,
      otherUserId
    );

    res.status(200).json({
      message: "Chat ready",
      chat,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create/get chat",
    });
  }
};