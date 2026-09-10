import { searchUsers } from "../services/user.service.js";

export const searchUsersController = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email query is required",
      });
    }

    const users = await searchUsers(email, req.userId);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to search users",
    });
  }
};