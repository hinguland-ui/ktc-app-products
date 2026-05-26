import { Router } from "express";
import { Product } from "../models/Product";
import { PriceHistory } from "../models/PriceHistory";
import { Notification } from "../models/Notification";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const prods = await Product.find().sort({ updatedAt: -1 });
    res.json(prods.map((p) => ({ ...p.toObject(), id: p._id.toString() })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    if (!body.name) { res.status(400).json({ error: "Name required" }); return; }
    const prod = await Product.create(body);
    await Notification.create({ title: "New Product Added", message: `${body.name} (${body.sku ?? ""}) added`, type: "new_product" });
    res.status(201).json({ ...prod.toObject(), id: prod._id.toString() });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Server error" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...prod.toObject(), id: prod._id.toString() });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const body = req.body;
    const updatedBy = body.updatedBy ?? "Unknown";
    const updated = await Product.findByIdAndUpdate(req.params.id, { ...body, updatedBy }, { new: true });

    const trackSlab = async (type: "retail" | "wholesale" | "bulk", oldSlabs: any[], newSlabs: any[]) => {
      if (!oldSlabs?.length || !newSlabs?.length) return;
      const oldPrice = oldSlabs[0].price;
      const newPrice = newSlabs[0].price;
      if (oldPrice !== newPrice) {
        const diff = newPrice - oldPrice;
        const pct = parseFloat(((diff / oldPrice) * 100).toFixed(2));
        await PriceHistory.create({ productId: req.params.id, productName: existing.name, pricingType: type, oldPrice, newPrice, difference: diff, percentageChange: pct, updatedBy });
        const dir = diff > 0 ? "increased" : "decreased";
        await Notification.create({ title: "Price Updated", message: `${existing.name} ${type} price ${dir} by ₹${Math.abs(diff)} (${Math.abs(pct)}%)`, type: "price_update" });
      }
    };

    await trackSlab("retail", existing.retailSlabs, body.retailSlabs ?? []);
    await trackSlab("wholesale", existing.wholesaleSlabs, body.wholesaleSlabs ?? []);
    await trackSlab("bulk", existing.bulkSlabs, body.bulkSlabs ?? []);

    res.json({ ...updated!.toObject(), id: updated!._id.toString() });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Server error" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.get("/:id/history", async (req, res) => {
  try {
    const hist = await PriceHistory.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(hist.map((h) => ({ ...h.toObject(), id: h._id.toString(), updatedAt: h.createdAt })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
