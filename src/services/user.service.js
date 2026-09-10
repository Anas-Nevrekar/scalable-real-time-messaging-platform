import User from "../models/User.js";

export const searchUsers = async (email, currentUserId) => {
  return User.find({
    email: { $regex: `^${email}`, $options: "i" },
    _id: { $ne: currentUserId },
  })
    .select("_id name email")
    .limit(10);
};