import { mongoose } from "../lib/mongo";

const priceHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  pricingType: { type: String, enum: ['retail', 'wholesale', 'bulk'], required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  difference: { type: Number, required: true },
  percentageChange: { type: Number, required: true },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

export const PriceHistory = mongoose.models.PriceHistory || mongoose.model("PriceHistory", priceHistorySchema);
