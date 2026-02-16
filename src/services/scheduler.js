import cron from "node-cron";
import { supabase } from "../config/db.js";
import { greenApiService } from "./greenApi.js";
import { formatProductMessage } from "./messageFormatter.js";

async function selectProducts(schedule) {
  let query = supabase.from("products").select("*").eq("is_active", true);

  if (schedule.category_filter?.length > 0) {
    query = query.in("category", schedule.category_filter);
  }

  const limit = schedule.products_per_slot || 1;

  switch (schedule.product_selection_strategy) {
    case "least_sent":
      query = query.order("times_sent", { ascending: true }).order("created_at", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "round_robin":
    default:
      query = query.order("last_sent_at", { ascending: true, nullsFirst: true }).order("created_at", { ascending: true });
      break;
  }

  const { data } = await query.limit(limit);
  return data || [];
}

export async function executeSchedule(schedule, group) {
  const products = await selectProducts(schedule);

  for (const product of products) {
    const { data: log } = await supabase
      .from("message_logs")
      .insert({
        group_id: group.id,
        product_id: product.id,
        schedule_id: schedule.id,
        status: "pending",
        trigger_type: "scheduled",
      })
      .select()
      .single();

    try {
      const prodData = {
        name: product.name, price: product.price, originalPrice: product.original_price,
        currency: product.currency, description: product.description,
        imageUrl: product.image_url, affiliateLink: product.affiliate_link,
      };

      const messageText = formatProductMessage(prodData, {
        prefix: group.message_prefix, suffix: group.message_suffix, language: group.language,
      });

      const result = await greenApiService.sendProductMessage(group.chat_id, prodData, {
        prefix: group.message_prefix, suffix: group.message_suffix, language: group.language,
      });

      await supabase.from("message_logs").update({
        status: "sent", green_api_message_id: result.idMessage,
        message_content: messageText, sent_at: new Date().toISOString(),
      }).eq("id", log.id);

      await supabase.from("products").update({
        times_sent: product.times_sent + 1, last_sent_at: new Date().toISOString(),
      }).eq("id", product.id);

      await supabase.from("groups").update({
        total_messages_sent: group.total_messages_sent + 1,
        last_message_sent_at: new Date().toISOString(),
      }).eq("id", group.id);

      await supabase.from("schedules").update({
        last_executed_at: new Date().toISOString(),
      }).eq("id", schedule.id);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      await supabase.from("message_logs").update({
        status: "failed", error_message: err.message,
      }).eq("id", log.id);
      console.error(`Failed to send product ${product.id} to group ${group.chat_id}:`, err.message);
    }
  }
}

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
    if (this.cronJob) { this.cronJob.stop(); }
  }

  async tick() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      const { data: schedules } = await supabase
        .from("schedules")
        .select("*, groups(*)")
        .eq("is_active", true);

      for (const schedule of schedules || []) {
        if (schedule.days_of_week?.length > 0 && !schedule.days_of_week.includes(currentDay)) continue;

        const matchingTime = (schedule.send_times || []).find(
          (t) => t.hour === currentHour && t.minute === currentMinute
        );
        if (!matchingTime) continue;

        const group = schedule.groups;
        if (!group || !group.is_active) continue;

        await executeSchedule(schedule, group);
      }
    } catch (err) {
      console.error("Scheduler tick error:", err);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const schedulerService = new SchedulerService();
