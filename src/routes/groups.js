import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import { supabase } from "../config/db.js";
import { greenApiService } from "../services/greenApi.js";

const router = Router();

// GET /api/groups
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("groups").select("*").eq("id", req.params.id).single();
    if (error) return res.status(404).json({ error: "Group not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/groups
router.post(
  "/",
  [body("name").notEmpty().trim(), body("chatId").notEmpty().trim()],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, chatId, description, settings } = req.body;
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name,
          chat_id: chatId,
          description,
          max_messages_per_day: settings?.maxMessagesPerDay || 3,
          preferred_categories: settings?.preferredCategories || [],
          language: settings?.language || "he",
          message_prefix: settings?.messagePrefix,
          message_suffix: settings?.messageSuffix,
        })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/groups/:id
router.put("/:id", async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.chatId !== undefined) updates.chat_id = req.body.chatId;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;
    if (req.body.settings) {
      const s = req.body.settings;
      if (s.maxMessagesPerDay !== undefined) updates.max_messages_per_day = s.maxMessagesPerDay;
      if (s.preferredCategories !== undefined) updates.preferred_categories = s.preferredCategories;
      if (s.language !== undefined) updates.language = s.language;
      if (s.messagePrefix !== undefined) updates.message_prefix = s.messagePrefix;
      if (s.messageSuffix !== undefined) updates.message_suffix = s.messageSuffix;
    }

    const { data, error } = await supabase
      .from("groups").update(updates).eq("id", req.params.id).select().single();
    if (error) return res.status(404).json({ error: "Group not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/groups/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { error } = await supabase.from("groups").delete().eq("id", req.params.id);
    if (error) return res.status(404).json({ error: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/:id/test
router.post("/:id/test", async (req, res, next) => {
  try {
    const { data: group, error } = await supabase
      .from("groups").select("*").eq("id", req.params.id).single();
    if (error) return res.status(404).json({ error: "Group not found" });

    const result = await greenApiService.sendTextMessage(
      group.chat_id,
      "Test message from WhatsApp Community Manager"
    );
    res.json({ message: "Test message sent", result });
  } catch (error) {
    next(error);
  }
});

export default router;
