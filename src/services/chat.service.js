import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getChatsForUser = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .lean();

  const otherUserIds = chats
    .flatMap((chat) => chat.participants)
    .filter((participantId) => String(participantId) !== String(userId));
  const users = await User.find({ _id: { $in: otherUserIds } })
    .select("name email")
    .lean();
  const usersById = new Map(users.map((user) => [String(user._id), user]));

  return chats.map((chat) => {
    const otherUserId = chat.participants.find(
      (participantId) => String(participantId) !== String(userId),
    );
    const otherUser = usersById.get(String(otherUserId));

    return {
      ...chat,
      otherUser: otherUser
        ? {
            id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
          }
        : null,
    };
  });
};

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