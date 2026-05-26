import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import historyRouter from "./history.js";
import notificationsRouter from "./notifications.js";
import staffRouter from "./staff.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/history", historyRouter);
router.use("/notifications", notificationsRouter);
router.use("/staff", staffRouter);
router.use("/settings", settingsRouter);

export default router;
