import { mongoose } from "../lib/mongo.js";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#66D48F' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
