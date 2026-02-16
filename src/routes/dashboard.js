import { Router } from "express";
import { supabase } from "../config/db.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekISO = weekStart.toISOString();

    const [products, activeProducts, groups, activeGroups, sentToday, sentWeek, failedToday] =
      await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("groups").select("id", { count: "exact", head: true }),
        supabase.from("groups").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("status", "sent").gte("created_at", todayISO),
        supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("status", "sent").gte("created_at", weekISO),
        supabase.from("message_logs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", todayISO),
      ]);

    const messagesToday = sentToday.count || 0;
    const failedCount = failedToday.count || 0;
    const totalToday = messagesToday + failedCount;
    const successRate = totalToday > 0 ? Math.round((messagesToday / totalToday) * 100) : 100;

    res.json({
      totalProducts: products.count || 0,
      activeProducts: activeProducts.count || 0,
      totalGroups: groups.count || 0,
      activeGroups: activeGroups.count || 0,
      messagesToday,
      messagesThisWeek: sentWeek.count || 0,
      successRate,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/recent-messages
router.get("/recent-messages", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("message_logs")
      .select("*, groups(name), products(name, image_url)")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/schedule-overview
router.get("/schedule-overview", async (req, res, next) => {
  try {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const { data: schedules, error } = await supabase
      .from("schedules")
      .select("*, groups(name, chat_id)")
      .eq("is_active", true);
    if (error) throw error;

    const upcoming = [];
    for (const schedule of schedules) {
      if (schedule.days_of_week?.length > 0 && !schedule.days_of_week.includes(currentDay)) {
        continue;
      }

      for (const time of schedule.send_times || []) {
        if (time.hour > currentHour || (time.hour === currentHour && time.minute > currentMinute)) {
          upcoming.push({
            scheduleId: schedule.id,
            groupName: schedule.groups?.name,
            chatId: schedule.groups?.chat_id,
            hour: time.hour,
            minute: time.minute,
            productsPerSlot: schedule.products_per_slot,
            strategy: schedule.product_selection_strategy,
          });
        }
      }
    }

    upcoming.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    res.json(upcoming);
  } catch (error) {
    next(error);
  }
});

export default router;
