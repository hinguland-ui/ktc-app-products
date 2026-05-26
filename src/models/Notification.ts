import { mongoose } from "../lib/mongo.js";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['price_update', 'new_product', 'new_category', 'alert'], default: 'alert' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
