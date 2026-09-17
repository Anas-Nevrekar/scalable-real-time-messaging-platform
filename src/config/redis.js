import Redis from "ioredis";

const redisPublisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const redisSubscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisPublisher.on("connect", () => {
  console.log("Redis publisher connected");
});

redisSubscriber.on("connect", () => {
  console.log("Redis subscriber connected");
});

redisPublisher.on("error", (error) => {
  console.error("Redis publisher error:", error.message);
});

redisSubscriber.on("error", (error) => {
  console.error("Redis subscriber error:", error.message);
});

export { redisPublisher, redisSubscriber };