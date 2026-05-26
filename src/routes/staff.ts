import { Router } from "express";
import { User } from "../models/User";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).sort({ createdAt: -1 });
    res.json(staff.map((u) => {
      const { password: _p, ...safe } = u.toObject();
      return { ...safe, id: safe._id.toString() };
    }));
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, mobile, password, permissions } = req.body;
    if (!name || !mobile || !password) {
      res.status(400).json({ error: "Name, mobile, and password required" });
      return;
    }
    const existing = await User.findOne({ mobile });
    if (existing) { res.status(409).json({ error: "Mobile number already in use" }); return; }
    const user = await User.create({ name, mobile, password, role: "staff", permissions: permissions ?? {}, isActive: true });
    const { password: _p, ...safe } = user.toObject();
    res.status(201).json({ ...safe, id: safe._id.toString() });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { password: _p, role: _r, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true });
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    const { password: __p, ...safe } = user.toObject();
    res.json({ ...safe, id: safe._id.toString() });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
