import { Router } from "express";
import Product from "../models/Product.js";
import Group from "../models/Group.js";
import Schedule from "../models/Schedule.js";
import MessageLog from "../models/MessageLog.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      activeProducts,
      totalGroups,
      activeGroups,
      messagesToday,
      messagesThisWeek,
      failedToday,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Group.countDocuments(),
      Group.countDocuments({ isActive: true }),
      MessageLog.countDocuments({
        createdAt: { $gte: todayStart },
        status: "sent",
      }),
      MessageLog.countDocuments({
        createdAt: { $gte: weekStart },
        status: "sent",
      }),
      MessageLog.countDocuments({
        createdAt: { $gte: todayStart },
        status: "failed",
      }),
    ]);

    const totalToday = messagesToday + failedToday;
    const successRate =
      totalToday > 0 ? Math.round((messagesToday / totalToday) * 100) : 100;

    res.json({
      totalProducts,
      activeProducts,
      totalGroups,
      activeGroups,
      messagesToday,
      messagesThisWeek,
      successRate,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/recent-messages
router.get("/recent-messages", async (req, res, next) => {
  try {
    const messages = await MessageLog.find()
      .populate("groupId", "name")
      .populate("productId", "name imageUrl")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(messages);
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

    const schedules = await Schedule.find({ isActive: true }).populate(
      "groupId",
      "name chatId"
    );

    const upcoming = [];
    for (const schedule of schedules) {
      if (
        schedule.daysOfWeek.length > 0 &&
        !schedule.daysOfWeek.includes(currentDay)
      ) {
        continue;
      }

      for (const time of schedule.sendTimes) {
        if (
          time.hour > currentHour ||
          (time.hour === currentHour && time.minute > currentMinute)
        ) {
          upcoming.push({
            scheduleId: schedule._id,
            groupName: schedule.groupId?.name,
            chatId: schedule.groupId?.chatId,
            hour: time.hour,
            minute: time.minute,
            productsPerSlot: schedule.productsPerSlot,
            strategy: schedule.productSelectionStrategy,
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
