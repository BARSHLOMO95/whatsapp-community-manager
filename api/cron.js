import { supabase } from "../src/config/db.js";
import { greenApiService } from "../src/services/greenApi.js";
import { formatProductMessage } from "../src/services/messageFormatter.js";
import { executeSchedule } from "../src/services/scheduler.js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    const { data: schedules } = await supabase
      .from("schedules")
      .select("*, groups(*)")
      .eq("is_active", true);

    let totalSent = 0;

    for (const schedule of schedules || []) {
      if (schedule.days_of_week?.length > 0 && !schedule.days_of_week.includes(currentDay)) continue;

      const matchingTime = (schedule.send_times || []).find(
        (t) => t.hour === currentHour && t.minute === currentMinute
      );
      if (!matchingTime) continue;

      const group = schedule.groups;
      if (!group || !group.is_active) continue;

      await executeSchedule(schedule, group);
      totalSent++;
    }

    res.json({ ok: true, schedulesExecuted: totalSent, time: now.toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
