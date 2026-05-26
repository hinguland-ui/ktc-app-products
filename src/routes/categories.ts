import { Router } from "express";
import { Category } from "../models/Category";
import { Notification } from "../models/Notification";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: -1 });
    res.json(cats.map((c) => ({ ...c.toObject(), id: c._id.toString() })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, color, status } = req.body;
    if (!name) { res.status(400).json({ error: "Name required" }); return; }
    const cat = await Category.create({ name, color: color ?? "#66D48F", status: status ?? "active" });
    await Notification.create({ title: "Category Added", message: `${name} category created`, type: "new_category" });
    res.status(201).json({ ...cat.toObject(), id: cat._id.toString() });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...cat.toObject(), id: cat._id.toString() });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
