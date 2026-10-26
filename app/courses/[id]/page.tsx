import { notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { CourseWorkspace } from "@/components/course/CourseWorkspace";
import type { Course, Folder, Material, Product } from "@/lib/types";

// Per-user data, rendered on request.
export const instant = false;

export default async function CoursePage({ params }: PageProps<"/courses/[id]">) {
  const { id } = await params;
  const { supabase } = await getUser();

  const [{ data: course }, { data: materials }, { data: folders }, { data: products }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("materials")
      .select("id, course_id, title, kind, char_count, selected, created_at")
      .eq("course_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("folders").select("*").eq("course_id", id).order("created_at"),
    supabase.from("products").select("*").eq("course_id", id).order("created_at", { ascending: false }),
  ]);
  if (!course) notFound();

  return (
    <CourseWorkspace
      course={course as Course}
      initialMaterials={(materials ?? []) as Material[]}
      initialFolders={(folders ?? []) as Folder[]}
      initialProducts={(products ?? []) as Product[]}
    />
  );
}
