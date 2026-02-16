import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import Schedule from "../models/Schedule.js";
import { schedulerService } from "../services/scheduler.js";

const router = Router();

// GET /api/schedules
router.get("/", async (req, res, next) => {
  try {
    const schedules = await Schedule.find()
      .populate("groupId", "name chatId isActive")
      .sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

// GET /api/schedules/:id
router.get("/:id", async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate(
      "groupId",
      "name chatId isActive settings"
    );
    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });
    res.json(schedule);
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
      const schedule = await Schedule.create(req.body);
      const populated = await schedule.populate(
        "groupId",
        "name chatId isActive"
      );
      res.status(201).json(populated);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/schedules/:id
router.put("/:id", async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("groupId", "name chatId isActive");
    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schedules/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules/:id/execute - Manually trigger schedule
router.post("/:id/execute", async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate("groupId");
    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });

    const group = schedule.groupId;
    if (!group || !group.isActive)
      return res.status(400).json({ error: "Group is inactive or not found" });

    await schedulerService.executeSchedule(schedule, group);
    res.json({ message: "Schedule executed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
