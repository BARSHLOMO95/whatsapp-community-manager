import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    currency: { type: String, default: "USD" },
    description: { type: String, required: true, maxlength: 500 },
    imageUrl: { type: String, required: true },
    affiliateLink: { type: String, required: true },
    aliexpressProductId: { type: String, sparse: true },
    category: { type: String, default: "general" },
    tags: [String],
    isActive: { type: Boolean, default: true },
    timesSent: { type: Number, default: 0 },
    lastSentAt: { type: Date },
  },
  { timestamps: true }
);

productSchema.index({ isActive: 1, lastSentAt: 1 });
productSchema.index({ category: 1 });

export default mongoose.model("Product", productSchema);
