import Inbox from "../models/Inbox.js";
import Message from "../models/Message.js";

export const resendPendingMessages = async (userId, socket) => {
  const pendingMessages = await Inbox.find({
    userId,
  }).populate("messageId");


  for (const inbox of pendingMessages) {
    const message = inbox.messageId;

    if (!message) {
      continue;
    }

    socket.send(
      JSON.stringify({
        type: "newMessage",
        messageId: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
      })
    );
  }
};