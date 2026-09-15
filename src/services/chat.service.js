import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChatsForUser = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .lean();

  const otherUserIds = chats
    .flatMap((chat) => chat.participants)
    .filter(
      (participantId) => String(participantId) !== String(userId)
    );

  const users = await User.find({
    _id: { $in: otherUserIds },
  })
    .select("name email")
    .lean();

  const usersById = new Map(
    users.map((user) => [String(user._id), user])
  );

  const chatsWithLatestMessage = await Promise.all(
    chats.map(async (chat) => {
      const latestMessage = await Message.findOne({
        chatId: chat._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      const otherUserId = chat.participants.find(
        (participantId) =>
          String(participantId) !== String(userId)
      );

      const otherUser = usersById.get(
        String(otherUserId)
      );

      return {
        ...chat,

        otherUser: otherUser
          ? {
              id: otherUser._id,
              name: otherUser.name,
              email: otherUser.email,
            }
          : null,

        latestMessage: latestMessage
          ? {
              id: latestMessage._id,
              content: latestMessage.content,
              senderId: latestMessage.senderId,
              status: latestMessage.status,
              createdAt: latestMessage.createdAt,
            }
          : null,
      };
    })
  );


  chatsWithLatestMessage.sort((a, b) => {
    const timeA = a.latestMessage
      ? new Date(a.latestMessage.createdAt).getTime()
      : 0;

    const timeB = b.latestMessage
      ? new Date(b.latestMessage.createdAt).getTime()
      : 0;

    return timeB - timeA;
  });

  return chatsWithLatestMessage;
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