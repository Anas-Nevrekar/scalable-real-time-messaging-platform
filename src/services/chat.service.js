import Chat from "../models/Chat.js";

export const createOrGetDirectChat = async (userId, otherUserId) => {
  let chat = await Chat.findOne({
    type: "direct",
    participants: {
      $all: [userId, otherUserId],
    },
  });

  if (chat) {
    return chat;
  }

  chat = await Chat.create({
    type: "direct",
    participants: [userId, otherUserId],
    createdBy: userId,
  });

  return chat;
};