import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import Inbox from "../models/Inbox.js";
import { connectedUsers } from "../websocket/websocket.server.js";
import { redisPublisher } from "../config/redis.js";

export const getMessageHistory = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId,
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return Message.find({ chatId })
    .sort({ createdAt: 1 })
    .limit(50);
};

export const sendMessage = async (senderId, chatId, content) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  const isParticipant = chat.participants.some(
    (id) => id.toString() === senderId.toString()
  );

  if (!isParticipant) {
    throw new Error("User is not a member of this chat");
  }

  const recipientIds = chat.participants.filter(
    (id) => id.toString() !== senderId.toString()
  );

  // 1. Persist message first
  const message = await Message.create({
    chatId,
    senderId,
    content,
    status: "sent",
  });

  // 2. Create Inbox entry for every recipient
  for (const recipientId of recipientIds) {
    await Inbox.create({
      userId: recipientId,
      messageId: message._id,
    });
  }

  // 3. Try local delivery, otherwise publish to Redis
  for (const recipientId of recipientIds) {
    const recipientSocket = connectedUsers.get(
      recipientId.toString()
    );

    if (
      recipientSocket &&
      recipientSocket.readyState === recipientSocket.OPEN
    ) {
      // Recipient is connected to this Node.js instance
      recipientSocket.send(
        JSON.stringify({
          type: "newMessage",
          messageId: message._id,
          chatId,
          senderId,
          content,
        })
      );
    } else {
      try {
        await redisPublisher.publish(
        `user:${recipientId}`,
        JSON.stringify({
          type: "newMessage",
          messageId: message._id,
          chatId,
          senderId,
          content,
        })
      );
      }catch(e){
        console.error(
      `Redis publish failed for user ${recipientId}:`,
      e.message
    );
      }
    }
  }

  return message;
};

export const acknowledgeMessage = async (userId, messageId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  await Inbox.findOneAndDelete({
    userId,
    messageId,
  });

  message.status = "delivered";
  await message.save();

  return message;
};