import mongoose from "mongoose";

const inboxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  },
  { timestamps: true }
);

const Inbox = mongoose.model("Inbox", inboxSchema);

export default Inbox;