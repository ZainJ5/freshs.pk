import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  usageType: {
    type: String,
    enum: ["single", "multiple"],
    default: "multiple",
  },
  maxRedemptions: { type: Number, default: 0 }, // 0 = unlimited
  totalRedemptions: { type: Number, default: 0 },
  redeemedMobiles: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PromoCode ||
  mongoose.model("PromoCode", PromoCodeSchema);
