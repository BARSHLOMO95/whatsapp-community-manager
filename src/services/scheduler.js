import cron from "node-cron";
import Schedule from "../models/Schedule.js";
import Product from "../models/Product.js";
import MessageLog from "../models/MessageLog.js";
import { greenApiService } from "./greenApi.js";
import { formatProductMessage } from "./messageFormatter.js";

class SchedulerService {
  constructor() {
    this.cronJob = null;
    this.isProcessing = false;
  }

  start() {
    this.cronJob = cron.schedule("* * * * *", () => this.tick());
    console.log("Scheduler started");
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("Scheduler stopped");
    }
  }

  async tick() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      const schedules = await Schedule.find({ isActive: true }).populate(
        "groupId"
      );

      for (const schedule of schedules) {
        if (
          schedule.daysOfWeek.length > 0 &&
          !schedule.daysOfWeek.includes(currentDay)
        ) {
          continue;
        }

        const matchingTime = schedule.sendTimes.find(
          (t) => t.hour === currentHour && t.minute === currentMinute
        );
        if (!matchingTime) continue;

        const group = schedule.groupId;
        if (!group || !group.isActive) continue;

        await this.executeSchedule(schedule, group);
      }
    } catch (err) {
      console.error("Scheduler tick error:", err);
    } finally {
      this.isProcessing = false;
    }
  }

  async executeSchedule(schedule, group) {
    const products = await this.selectProducts(schedule);

    for (const product of products) {
      const log = await MessageLog.create({
        groupId: group._id,
        productId: product._id,
        scheduleId: schedule._id,
        status: "pending",
        triggerType: "scheduled",
      });

      try {
        const messageText = formatProductMessage(product, {
          prefix: group.settings?.messagePrefix,
          suffix: group.settings?.messageSuffix,
          language: group.settings?.language,
        });

        const result = await greenApiService.sendProductMessage(
          group.chatId,
          product,
          {
            prefix: group.settings?.messagePrefix,
            suffix: group.settings?.messageSuffix,
            language: group.settings?.language,
          }
        );

        log.status = "sent";
        log.greenApiMessageId = result.idMessage;
        log.messageContent = messageText;
        log.sentAt = new Date();
        await log.save();

        product.timesSent += 1;
        product.lastSentAt = new Date();
        await product.save();

        group.totalMessagesSent += 1;
        group.lastMessageSentAt = new Date();
        await group.save();

        schedule.lastExecutedAt = new Date();
        await schedule.save();

        // Delay between messages to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        log.status = "failed";
        log.errorMessage = err.message;
        await log.save();
        console.error(
          `Failed to send product ${product._id} to group ${group.chatId}:`,
          err.message
        );
      }
    }
  }

  async selectProducts(schedule) {
    const query = { isActive: true };

    if (schedule.categoryFilter && schedule.categoryFilter.length > 0) {
      query.category = { $in: schedule.categoryFilter };
    }

    if (schedule.productSelectionStrategy === "random") {
      return Product.aggregate([
        { $match: query },
        { $sample: { size: schedule.productsPerSlot } },
      ]);
    }

    let sortCriteria;
    switch (schedule.productSelectionStrategy) {
      case "least_sent":
        sortCriteria = { timesSent: 1, createdAt: -1 };
        break;
      case "newest":
        sortCriteria = { createdAt: -1 };
        break;
      case "round_robin":
      default:
        sortCriteria = { lastSentAt: 1, createdAt: 1 };
        break;
    }

    return Product.find(query)
      .sort(sortCriteria)
      .limit(schedule.productsPerSlot);
  }
}

export const schedulerService = new SchedulerService();
