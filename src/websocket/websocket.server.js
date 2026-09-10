import { WebSocketServer } from "ws";
import handleMessage from "./message.handler.js";

// userId → WebSocket
const connectedUsers = new Map();

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  // Heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((socket) => {
      // If previous ping wasn't answered
      if (socket.isAlive === false) {
        console.log(`Terminating dead connection: ${socket.userId}`);

        socket.terminate();
        return;
      }

      // Assume connection is dead until pong is received
      socket.isAlive = false;

      // Send ping
      console.log(`Sending ping to: ${socket.userId}`);
      socket.ping();
    });
  }, 30000);

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    // Initially assume connection is alive
    socket.isAlive = true;

    // Will be set after authentication
    socket.userId = null;

    // Client automatically responds with pong
    socket.on("pong", () => {
      console.log(`Pong received from: ${socket.userId}`);
      socket.isAlive = true;
    });

    // Handle incoming WebSocket messages
    socket.on("message", (data) => {
      handleMessage(socket, data);
    });

    // Handle disconnection
    socket.on("close", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId.toString());
      }

      console.log(
        `WebSocket client disconnected: ${socket.userId || "unauthenticated"}`
      );
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error(
        `WebSocket error for ${socket.userId || "unauthenticated"}:`,
        error.message
      );
    });
  });

  // Cleanup heartbeat timer when server shuts down
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
    console.log("WebSocket server closed");
  });

  return wss;
};

export { connectedUsers };

export default initializeWebSocket;