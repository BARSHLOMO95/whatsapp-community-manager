import { config } from "../src/config/env.js";
import { connectDB } from "../src/config/db.js";
import Schedule from "../src/models/Schedule.js";
import Product from "../src/models/Product.js";
import MessageLog from "../src/models/MessageLog.js";
import { greenApiService } from "../src/services/greenApi.js";
import { formatProductMessage } from "../src/services/messageFormatter.js";

async function selectProducts(schedule) {
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

  return Product.find(query).sort(sortCriteria).limit(schedule.productsPerSlot);
}

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (or with correct auth)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectDB();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    const schedules = await Schedule.find({ isActive: true }).populate("groupId");
    let totalSent = 0;

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

      const products = await selectProducts(schedule);

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

          totalSent++;

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
          log.status = "failed";
          log.errorMessage = err.message;
          await log.save();
        }
      }
    }

    res.json({ ok: true, messagesSent: totalSent, time: now.toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
