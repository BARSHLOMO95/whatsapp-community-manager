import { createClient } from "@supabase/supabase-js";
import { config } from "./env.js";

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

export async function connectDB() {
  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error && !error.message.includes("does not exist")) {
      throw error;
    }
    console.log("Supabase connected successfully");
  } catch (error) {
    console.error("Supabase connection error:", error.message);
    process.exit(1);
  }
}
