import { mongoose } from "../lib/mongo";

const priceSlabSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'KG' },
  price: { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  categoryId: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  stockStatus: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  tags: [{ type: String }],
  images: [{ type: String }],
  comingRate: { type: Number, default: 0 },
  retailSlabs: [priceSlabSchema],
  wholesaleSlabs: [priceSlabSchema],
  bulkSlabs: [priceSlabSchema],
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
