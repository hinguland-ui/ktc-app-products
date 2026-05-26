import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import historyRouter from "./history";
import notificationsRouter from "./notifications";
import staffRouter from "./staff";
import settingsRouter from "./settings";

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
