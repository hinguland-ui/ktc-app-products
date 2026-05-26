import { mongoose } from "../lib/mongo";

const permissionsSchema = new mongoose.Schema({
  canViewProducts: { type: Boolean, default: true },
  canEditProducts: { type: Boolean, default: false },
  canViewCategories: { type: Boolean, default: true },
  canEditCategories: { type: Boolean, default: false },
  canViewAnalytics: { type: Boolean, default: true },
  canViewHistory: { type: Boolean, default: true },
  canViewNotifications: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'staff'], default: 'staff' },
  permissions: { type: permissionsSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
