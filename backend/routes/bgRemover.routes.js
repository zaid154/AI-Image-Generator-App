import { Router } from "express";
import { handleRemoveBackground } from "../controllers/bgRemover.controller.js";

const router = Router();

router.post("/remove-background", handleRemoveBackground);
router.post("/remove-bg", handleRemoveBackground);

export default router;
