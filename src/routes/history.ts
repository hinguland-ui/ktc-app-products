import { Router } from "express";
import { PriceHistory } from "../models/PriceHistory.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { productId, type, from, to, limit: lim } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (productId) filter.productId = productId;
    if (type) filter.pricingType = type;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to);
    }
    const hist = await PriceHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(lim ? parseInt(lim) : 200);
    res.json(hist.map((h) => ({ ...h.toObject(), id: h._id.toString(), updatedAt: (h as any).createdAt })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
