import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    chatId: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    settings: {
      maxMessagesPerDay: { type: Number, default: 3 },
      preferredCategories: [String],
      language: { type: String, default: "he" },
      messagePrefix: { type: String },
      messageSuffix: { type: String },
    },
    memberCount: { type: Number },
    totalMessagesSent: { type: Number, default: 0 },
    lastMessageSentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
