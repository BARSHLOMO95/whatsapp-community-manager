import { Router } from "express";
import { supabase } from "../config/db.js";

const router = Router();

// GET /api/message-logs
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, groupId, productId, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("message_logs")
      .select("*, groups(id, name, chat_id), products(id, name, image_url, price)", { count: "exact" });

    if (groupId) query = query.eq("group_id", groupId);
    if (productId) query = query.eq("product_id", productId);
    if (status) query = query.eq("status", status);
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    const { data: logs, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      logs,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/message-logs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("message_logs")
      .select("*, groups(id, name, chat_id), products(id, name, image_url, price, affiliate_link), schedules(*)")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ error: "Log not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
