import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    sendTimes: [
      {
        hour: { type: Number, required: true, min: 0, max: 23 },
        minute: { type: Number, required: true, min: 0, max: 59 },
      },
    ],
    daysOfWeek: { type: [Number], default: [] },
    productsPerSlot: { type: Number, default: 1 },
    productSelectionStrategy: {
      type: String,
      enum: ["round_robin", "random", "least_sent", "newest"],
      default: "least_sent",
    },
    categoryFilter: [String],
    isActive: { type: Boolean, default: true },
    lastExecutedAt: { type: Date },
  },
  { timestamps: true }
);

scheduleSchema.index({ isActive: 1 });
scheduleSchema.index({ groupId: 1 });

export default mongoose.model("Schedule", scheduleSchema);
