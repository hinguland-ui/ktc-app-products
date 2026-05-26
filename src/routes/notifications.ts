import { Router } from "express";
import { Notification } from "../models/Notification.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notifs.map((n) => ({ ...n.toObject(), id: n._id.toString(), createdAt: (n as any).createdAt })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
