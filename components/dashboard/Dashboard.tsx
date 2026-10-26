"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { createCourse, deleteCourse, renameCourse } from "@/app/actions";
import { COLOR_CLASSES } from "@/lib/courses";
import { fmt, useI18n } from "@/lib/i18n/provider";
import type { Course } from "@/lib/types";
import { Header } from "@/components/Header";
import { CourseDialog } from "./CourseDialog";

type CourseItem = Course & { materialCount: number };

export function Dashboard({ username, courses }: { username: string; courses: CourseItem[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CourseItem | null>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t.dashboard.greeting.morning : hour < 18 ? t.dashboard.greeting.afternoon : t.dashboard.greeting.evening;

  async function handleCreate(name: string, emoji: string | null) {
    const id = await createCourse({ name, emoji });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    setCreating(false);
    router.push(`/courses/${id}`);
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            {greeting}, <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">{username}</span>{" "}
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, 18, -8, 18, 0] }}
              transition={{ duration: 1.6, delay: 0.4 }}
            >
              👋
            </motion.span>
          </h1>
          <p className="mt-2 text-lg text-slate-500">{t.dashboard.subtitle}</p>
        </motion.div>

        <h2 className="mb-4 text-lg font-bold text-slate-700">{t.dashboard.myCourses}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            onClick={() => setCreating(true)}
            className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-violet-300 bg-white/60 text-violet-600 transition hover:border-violet-500 hover:bg-white cursor-pointer"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 transition group-hover:rotate-90 group-hover:bg-violet-500 group-hover:text-white">
              <Plus size={28} />
            </span>
            <span className="font-semibold">{t.dashboard.newCourse}</span>
          </motion.button>

          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              whileHover={{ y: -6 }}
              className="relative"
            >
              <Link
                href={`/courses/${c.id}`}
                className="block overflow-hidden rounded-3xl bg-white shadow-md shadow-violet-100 transition hover:shadow-xl hover:shadow-violet-200"
              >
                <div className={`flex h-24 items-center bg-gradient-to-br ${COLOR_CLASSES[c.color] ?? COLOR_CLASSES.violet} px-6`}>
                  <span className="text-5xl drop-shadow">{c.emoji ?? "📘"}</span>
                </div>
                <div className="p-5">
                  <h3 className="truncate text-lg font-bold text-slate-800">{c.name}</h3>
                  <div className="mt-1 flex justify-between text-sm text-slate-500">
                    <span>{fmt(t.dashboard.materials, { n: c.materialCount })}</span>
                    <span>
                      {fmt(t.dashboard.lastActivity, {
                        date: new Date(c.updated_at).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                      })}
                    </span>
                  </div>
                </div>
              </Link>
              <CourseMenu
                onRename={() => setEditing(c)}
                onDelete={async () => {
                  if (confirm(t.common.confirmDelete)) await deleteCourse(c.id);
                }}
              />
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && (
          <p className="mt-8 text-center text-slate-400">{t.dashboard.noCourses}</p>
        )}
      </main>

      <CourseDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
        title={t.dashboard.newCourseTitle}
        allowSkip
      />
      <CourseDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={editing ? { name: editing.name, emoji: editing.emoji } : undefined}
        onSubmit={async (name, emoji) => {
          if (editing) await renameCourse(editing.id, name, emoji);
          setEditing(null);
        }}
        title={t.dashboard.renameCourse}
      />
    </>
  );
}

function CourseMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-3 end-3">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-full bg-white/80 p-1.5 text-slate-600 hover:bg-white cursor-pointer"
        aria-label="Course menu"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute end-0 z-10 mt-1 w-40 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-violet-100">
          <button onClick={onRename} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-violet-50 cursor-pointer">
            <Pencil size={14} /> {t.common.rename}
          </button>
          <button onClick={onDelete} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer">
            <Trash2 size={14} /> {t.common.delete}
          </button>
        </div>
      )}
    </div>
  );
}
