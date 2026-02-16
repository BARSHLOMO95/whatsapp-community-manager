import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import Group from "../models/Group.js";
import { greenApiService } from "../services/greenApi.js";

const router = Router();

// GET /api/groups
router.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:id
router.get("/:id", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (error) {
    next(error);
  }
});

// POST /api/groups
router.post(
  "/",
  [
    body("name").notEmpty().trim(),
    body("chatId").notEmpty().trim(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const group = await Group.create(req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/groups/:id
router.put("/:id", async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/groups/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/:id/test - Send test message
router.post("/:id/test", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const result = await greenApiService.sendTextMessage(
      group.chatId,
      "Test message from WhatsApp Community Manager"
    );
    res.json({ message: "Test message sent", result });
  } catch (error) {
    next(error);
  }
});

export default router;
