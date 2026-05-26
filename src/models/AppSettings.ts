import { mongoose } from "../lib/mongo.js";

const appSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const AppSettings = mongoose.models.AppSettings || mongoose.model("AppSettings", appSettingsSchema);
