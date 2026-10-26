import { getUser } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Landing } from "@/components/landing/Landing";
import type { Course } from "@/lib/types";

// Per-user data, rendered on request.
export const instant = false;

export default async function HomePage() {
  const { supabase, user } = await getUser();
  if (!user) return <Landing />;

  const [{ data: profile }, { data: courses }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).single(),
    supabase
      .from("courses")
      .select("id, name, emoji, color, created_at, updated_at, materials(count), products(created_at)")
      .order("created_at", { ascending: false }),
  ]);

  const list = (courses ?? []).map((c) => {
    const lastProduct = (c.products as { created_at: string }[])
      .map((p) => p.created_at)
      .sort()
      .at(-1);
    return {
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      created_at: c.created_at,
      updated_at: lastProduct && lastProduct > c.updated_at ? lastProduct : c.updated_at,
      materialCount: (c.materials as { count: number }[])[0]?.count ?? 0,
    };
  }) as (Course & { materialCount: number })[];

  return <Dashboard username={profile?.username ?? ""} courses={list} />;
}
