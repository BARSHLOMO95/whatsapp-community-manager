import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import { supabase } from "../config/db.js";
import { executeSchedule } from "../services/scheduler.js";

const router = Router();

// GET /api/schedules (join with groups)
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("*, groups(id, name, chat_id, is_active)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/schedules/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("*, groups(id, name, chat_id, is_active, language, message_prefix, message_suffix)")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ error: "Schedule not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules
router.post(
  "/",
  [
    body("groupId").notEmpty(),
    body("sendTimes").isArray({ min: 1 }),
    body("sendTimes.*.hour").isInt({ min: 0, max: 23 }),
    body("sendTimes.*.minute").isInt({ min: 0, max: 59 }),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { groupId, sendTimes, daysOfWeek, productsPerSlot, productSelectionStrategy, categoryFilter, isActive } = req.body;
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          group_id: groupId,
          send_times: sendTimes,
          days_of_week: daysOfWeek || [],
          products_per_slot: productsPerSlot || 1,
          product_selection_strategy: productSelectionStrategy || "least_sent",
          category_filter: categoryFilter || [],
          is_active: isActive !== false,
        })
        .select("*, groups(id, name, chat_id, is_active)")
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/schedules/:id
router.put("/:id", async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.groupId !== undefined) updates.group_id = req.body.groupId;
    if (req.body.sendTimes !== undefined) updates.send_times = req.body.sendTimes;
    if (req.body.daysOfWeek !== undefined) updates.days_of_week = req.body.daysOfWeek;
    if (req.body.productsPerSlot !== undefined) updates.products_per_slot = req.body.productsPerSlot;
    if (req.body.productSelectionStrategy !== undefined) updates.product_selection_strategy = req.body.productSelectionStrategy;
    if (req.body.categoryFilter !== undefined) updates.category_filter = req.body.categoryFilter;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

    const { data, error } = await supabase
      .from("schedules")
      .update(updates)
      .eq("id", req.params.id)
      .select("*, groups(id, name, chat_id, is_active)")
      .single();
    if (error) return res.status(404).json({ error: "Schedule not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schedules/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { error } = await supabase.from("schedules").delete().eq("id", req.params.id);
    if (error) return res.status(404).json({ error: "Schedule not found" });
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules/:id/execute
router.post("/:id/execute", async (req, res, next) => {
  try {
    const { data: schedule, error } = await supabase
      .from("schedules")
      .select("*, groups(*)")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ error: "Schedule not found" });

    const group = schedule.groups;
    if (!group || !group.is_active)
      return res.status(400).json({ error: "Group is inactive or not found" });

    await executeSchedule(schedule, group);
    res.json({ message: "Schedule executed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
