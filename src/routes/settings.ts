import { Router } from "express";
import { AppSettings } from "../models/AppSettings.js";
import nodemailer from "nodemailer";

const router = Router();

async function getSetting(key: string) {
  const s = await AppSettings.findOne({ key });
  return s?.value ?? null;
}

async function setSetting(key: string, value: unknown) {
  await AppSettings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
}

router.get("/cloudinary", async (req, res) => {
  try {
    const cfg = await getSetting("cloudinary");
    res.json(cfg ?? { cloudName: "", apiKey: "", apiSecret: "" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/cloudinary", async (req, res) => {
  try {
    await setSetting("cloudinary", req.body);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/cloudinary/test", async (req, res) => {
  try {
    const { cloudName, apiKey, apiSecret } = (req.body ?? {}) as Record<string, string>;
    if (!cloudName || !apiKey || !apiSecret) {
      res.status(400).json({ ok: false, error: "All Cloudinary fields required" });
      return;
    }
    const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`;
    const creds = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const resp = await fetch(testUrl, { headers: { Authorization: `Basic ${creds}` } });
    if (resp.ok) {
      const data = await resp.json() as { total_count?: number };
      res.json({ ok: true, message: `Connected! ${data.total_count ?? 0} images in storage.`, totalCount: data.total_count ?? 0 });
    } else {
      res.json({ ok: false, error: "Invalid credentials" });
    }
  } catch (err) {
    res.json({ ok: false, error: String(err) });
  }
});

router.get("/smtp", async (req, res) => {
  try {
    const cfg = await getSetting("smtp");
    if (cfg && typeof cfg === 'object' && 'password' in (cfg as object)) {
      const { password: _p, ...safe } = cfg as Record<string, unknown>;
      res.json(safe);
    } else {
      res.json(cfg ?? { host: "", port: 587, username: "", fromEmail: "" });
    }
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/smtp", async (req, res) => {
  try {
    const current = (await getSetting("smtp")) as Record<string, unknown> | null;
    const { password, ...rest } = req.body as Record<string, unknown>;
    const toSave = { ...(current ?? {}), ...rest };
    if (password) toSave.password = password;
    await setSetting("smtp", toSave);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/smtp/test", async (req, res) => {
  try {
    const cfg = (await getSetting("smtp")) as Record<string, unknown> | null;
    if (!cfg) { res.json({ ok: false, error: "SMTP not configured" }); return; }
    const { host, port, username, password, fromEmail } = cfg as Record<string, string>;
    if (!host || !username || !password) { res.json({ ok: false, error: "Incomplete SMTP config" }); return; }
    const transporter = nodemailer.createTransport({ host, port: Number(port) || 587, auth: { user: username, pass: password }, secure: Number(port) === 465 });
    await transporter.verify();
    await transporter.sendMail({ from: fromEmail || username, to: username, subject: "KTC SMTP Test", text: "SMTP is configured correctly for KTC app." });
    res.json({ ok: true, message: "Test email sent successfully!" });
  } catch (err) {
    res.json({ ok: false, error: String(err) });
  }
});

router.post("/upload", async (req, res) => {
  try {
    const cfg = (await getSetting("cloudinary")) as Record<string, string> | null;
    if (!cfg?.cloudName) { res.status(400).json({ error: "Cloudinary not configured" }); return; }
    const { imageBase64, folder } = req.body as { imageBase64: string; folder?: string };
    const creds = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
    const formData = new URLSearchParams();
    formData.append("file", imageBase64);
    formData.append("folder", folder ?? "ktc");
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
      method: "POST",
      headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    const data = await resp.json() as { secure_url?: string; error?: { message: string } };
    if (data.secure_url) {
      res.json({ url: data.secure_url });
    } else {
      res.status(400).json({ error: data.error?.message ?? "Upload failed" });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
