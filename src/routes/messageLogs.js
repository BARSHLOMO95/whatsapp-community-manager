import { Router } from "express";
import MessageLog from "../models/MessageLog.js";

const router = Router();

// GET /api/message-logs
router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      groupId,
      productId,
      status,
      startDate,
      endDate,
    } = req.query;

    const query = {};
    if (groupId) query.groupId = groupId;
    if (productId) query.productId = productId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await MessageLog.countDocuments(query);
    const logs = await MessageLog.find(query)
      .populate("groupId", "name chatId")
      .populate("productId", "name imageUrl price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/message-logs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const log = await MessageLog.findById(req.params.id)
      .populate("groupId", "name chatId")
      .populate("productId", "name imageUrl price affiliateLink")
      .populate("scheduleId");
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (error) {
    next(error);
  }
});

export default router;
