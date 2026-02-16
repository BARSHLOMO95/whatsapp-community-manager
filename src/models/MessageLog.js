import mongoose from "mongoose";

const messageLogSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    greenApiMessageId: { type: String },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
    messageContent: { type: String },
    sentAt: { type: Date },
    triggerType: {
      type: String,
      enum: ["scheduled", "manual"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

messageLogSchema.index({ groupId: 1, createdAt: -1 });
messageLogSchema.index({ status: 1 });
messageLogSchema.index({ sentAt: -1 });

export default mongoose.model("MessageLog", messageLogSchema);
