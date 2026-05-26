import { Router } from "express";
import { User } from "../models/User";

const router = Router();

const ADMIN = {
  mobile: "9950925680",
  password: "krishan@5680",
  name: "Admin",
  role: "super_admin" as const,
};

async function ensureAdmin() {
  await User.findOneAndUpdate(
    { mobile: ADMIN.mobile },
    { name: ADMIN.name, mobile: ADMIN.mobile, password: ADMIN.password, role: ADMIN.role, isActive: true },
    { upsert: true, new: true },
  );
}

function sanitizeUser(user: Record<string, unknown>) {
  const { password: _p, passwordHash: _ph, __v: _v, ...safe } = user;
  return { ...safe, id: String(safe._id) };
}

router.post("/login", async (req, res) => {
  try {
    await ensureAdmin();
    const { mobile, password } = req.body as { mobile: string; password: string };
    if (!mobile || !password) {
      res.status(400).json({ error: "Mobile and password required" });
      return;
    }
    const user = await User.findOne({ mobile: mobile.trim(), isActive: true });
    if (!user || user.password !== password.trim()) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.json({ user: sanitizeUser(user.toObject()) });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  const id = req.headers["x-user-id"] as string;
  if (!id) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const user = await User.findById(id);
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ user: sanitizeUser(user.toObject()) });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
