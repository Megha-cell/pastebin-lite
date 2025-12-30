import express from "express";
import { createPaste } from "../controllers/pasteController.js";
import { getPaste } from "../controllers/getPaste.js";

const router = express.Router();

router.post("/", createPaste);
router.get("/:id", getPaste);

export default router;
