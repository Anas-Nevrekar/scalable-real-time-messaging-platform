import { getMessageHistory } from "../services/message.service.js";

export const getHistory = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await getMessageHistory(
      chatId,
      req.userId
    );

    res.status(200).json({
      chatId,
      messages,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Chat not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch message history",
    });
  }
};