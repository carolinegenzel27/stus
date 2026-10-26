"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { COURSE_COLORS, nextDefaultName } from "@/lib/courses";

export async function createCourse(input: { name?: string; emoji?: string | null }) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Unauthorized");

  let name = input.name?.trim();
  if (!name) {
    const { data } = await supabase.from("courses").select("name").like("name", "course\\_%");
    name = nextDefaultName((data ?? []).map((c) => c.name));
  }
  const { count } = await supabase.from("courses").select("id", { count: "exact", head: true });
  const color = COURSE_COLORS[(count ?? 0) % COURSE_COLORS.length];

  const { data, error } = await supabase
    .from("courses")
    .insert({ name: name.slice(0, 80), emoji: input.emoji || null, color })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data.id as string;
}

export async function renameCourse(id: string, name: string, emoji: string | null) {
  const { supabase } = await getUser();
  const trimmed = name.trim();
  if (!trimmed) return;
  await supabase
    .from("courses")
    .update({ name: trimmed.slice(0, 80), emoji, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/");
  revalidatePath(`/courses/${id}`);
}

export async function deleteCourse(id: string) {
  const { supabase, user } = await getUser();
  if (!user) return;
  const { data: files } = await supabase
    .from("materials")
    .select("storage_path")
    .eq("course_id", id)
    .not("storage_path", "is", null);
  const paths = (files ?? []).map((f) => f.storage_path as string);
  if (paths.length) await supabase.storage.from("materials").remove(paths);
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/");
}

export async function logout() {
  const { supabase } = await getUser();
  await supabase.auth.signOut();
}
