import express from "express";
import { authenticateToken } from "../../middlewares/auth";

const router = express.Router();

import { shorten, redirect, deleteUrl } from "./urls.controllers";

router.post("/shorten", authenticateToken, shorten);
router.get("/:code", redirect);
router.delete("/:code", authenticateToken, deleteUrl);

export default router;
