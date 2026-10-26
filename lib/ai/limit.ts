import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AiError } from "./client";

/** Uses one of today's AI credits; throws when the daily limit is reached. Returns credits left. */
export async function consumeCredit(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("consume_ai_credit");
  if (error) {
    console.error("consume_ai_credit failed:", error.message);
    throw new AiError("AI usage limit is not set up yet (run supabase/migrations/0002_ai_usage.sql).", 500);
  }
  if (data < 0) throw new AiError("Daily AI limit reached.", 429, "daily_limit");
  return data as number;
}
