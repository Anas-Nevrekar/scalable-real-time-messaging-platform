import { verifyToken } from "../utils/jwt.js";
import {
  sendMessage,
  acknowledgeMessage,
} from "../services/message.service.js";
import { resendPendingMessages } from "../services/inbox.service.js";
import { connectedUsers } from "./websocket.server.js";

const handleMessage = (socket, data) => {
  try {
    const message = JSON.parse(data);

    switch (message.type) {
      case "authenticate":
        handleAuthenticate(socket, message);
        break;

      case "sendMessage":
        handleSendMessage(socket, message);
        break;

      case "ackMessage":
        handleAckMessage(socket, message);
        break;

      case "reconnect":
        handleReconnect(socket, message);
        break;

      default:
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Unknown event type",
          })
        );
    }
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid message format",
      })
    );
  }
};

const handleAuthenticate = async (socket, message) => {
  try {
    // 1. Verify JWT
    const decoded = verifyToken(message.token);

    const userId = decoded.userId;

    // 2. Associate user with socket
    socket.userId = userId;

    // 3. Store active connection
    connectedUsers.set(userId.toString(), socket);

    // 4. Tell client authentication succeeded
    socket.send(
      JSON.stringify({
        type: "authenticated",
        userId,
      })
    );

    // 5. Resend pending Inbox messages
    await resendPendingMessages(userId, socket);

    console.log(`User ${userId} authenticated and reconnected`);
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid or expired token",
      })
    );

    socket.close();
  }
};

const handleSendMessage = async (socket, message) => {
  try {
    const { chatId, content } = message;

    const savedMessage = await sendMessage(
      socket.userId,
      chatId,
      content
    );

    socket.send(
      JSON.stringify({
        type: "messageSent",
        messageId: savedMessage._id,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: error.message,
      })
    );
  }
};

const handleAckMessage = async (socket, message) => {
  try {
    const { messageId } = message;

    await acknowledgeMessage(
      socket.userId,
      messageId
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: error.message,
      })
    );
  }
};

const handleReconnect = (socket) => {
  // Authentication already handles reconnection.
  console.log(`User ${socket.userId} reconnected`);
};

export default handleMessage;