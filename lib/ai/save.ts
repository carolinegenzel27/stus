import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductType } from "@/lib/types";

export async function saveProduct(
  supabase: SupabaseClient,
  row: {
    course_id: string;
    type: ProductType;
    title: string;
    options: object;
    content: object;
    material_ids: string[];
  },
) {
  const { data, error } = await supabase.from("products").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  await supabase.from("courses").update({ updated_at: new Date().toISOString() }).eq("id", row.course_id);
  return data;
}
