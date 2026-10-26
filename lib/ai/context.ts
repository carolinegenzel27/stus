import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocale } from "@/lib/i18n";
import { AiError, MAX_MATERIAL_CHARS } from "./client";

type ProfileRow = {
  student_type: string | null;
  year: string | null;
  field: string | null;
  goals: string[] | null;
};

/** AI output always follows the language the student chose in the app. */
export async function outputLanguage() {
  return (await getLocale()) === "he" ? "Hebrew" : "English";
}

export const LANGUAGE_RULE = (lang: string) =>
  `Always write your entire answer in ${lang}, even when the study materials are in another language. You may add the original technical term in parentheses after a translated term, e.g. "אנטרופיה (Entropy)".`;

const TYPE_LABEL: Record<string, string> = {
  highschool: "a high-school student",
  undergrad: "an undergraduate university student",
  grad: "a graduate student (MA/PhD)",
  prep: "a student in a pre-academic preparatory program",
  self: "a self-learner",
};

/** Loads the student profile and the selected materials for a course (RLS-scoped). */
export async function loadContext(supabase: SupabaseClient, userId: string, courseId: string, materialIds: string[]) {
  if (!materialIds.length) throw new AiError("Select at least one material.", 400);

  const [{ data: profile }, { data: course }, { data: materials }] = await Promise.all([
    supabase.from("profiles").select("student_type, year, field, goals").eq("id", userId).single(),
    supabase.from("courses").select("id, name").eq("id", courseId).single(),
    supabase.from("materials").select("id, title, content").eq("course_id", courseId).in("id", materialIds),
  ]);

  if (!course) throw new AiError("Course not found.", 404);
  if (!materials?.length) throw new AiError("No materials found.", 400);

  const total = materials.reduce((n, m) => n + m.content.length, 0);
  if (total > MAX_MATERIAL_CHARS) {
    throw new AiError("The selected materials are too long together. Select fewer materials.", 413);
  }

  const materialText = materials
    .map((m, i) => `<material index="${i + 1}" title="${m.title.replace(/"/g, "'")}">\n${m.content}\n</material>`)
    .join("\n\n");

  return {
    course,
    materials,
    materialText,
    system: buildSystem(profile as ProfileRow | null, course.name, await outputLanguage()),
  };
}

function buildSystem(p: ProfileRow | null, courseName: string, lang: string) {
  const who = p?.student_type ? TYPE_LABEL[p.student_type] ?? "a student" : "a student";
  const details = [
    p?.year && `level/year: ${p.year}`,
    p?.field && `field of study: ${p.field}`,
    p?.goals?.length && `wants help with: ${p.goals.join(", ")}`,
  ]
    .filter(Boolean)
    .join("; ");

  return `You are STUS, a friendly and precise private study assistant. The user is ${who}${
    details ? ` (${details})` : ""
  }, studying the course "${courseName}". Pitch explanations at their level.

Base everything on the study materials the student provides. Do not invent facts that are not supported by the materials; if something is missing from them, say so.

${LANGUAGE_RULE(lang)}`;
}
