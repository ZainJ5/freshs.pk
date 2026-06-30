import mongoose from "mongoose";

const ThresholdOfferSchema = new mongoose.Schema(
  {
    minOrderValue: { type: Number, required: true, min: 1 },
    rewardType: {
      type: String,
      enum: ["free_delivery", "fixed", "percentage"],
      required: true,
    },
    rewardValue: { type: Number, default: 0 }, // % for percentage, PKR for fixed, ignored for free_delivery
    label: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ThresholdOffer ||
  mongoose.model("ThresholdOffer", ThresholdOfferSchema);
