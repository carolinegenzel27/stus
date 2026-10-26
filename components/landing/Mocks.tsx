"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { BookOpenText, Check, ClipboardCheck, Layers, MessageCircle, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

/** Small illustrations of the real app UI, built from markup so they follow the language and direction. */

export function MockCourseCard({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={clsx("w-56 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-violet-900/20", className)}>
      <div className="flex h-16 items-center bg-gradient-to-br from-violet-400 to-purple-500 px-4 text-4xl">📐</div>
      <div className="p-3">
        <p className="font-bold text-slate-800">{t.landing.mock.course}</p>
        <p className="text-xs text-slate-400">{t.landing.mock.materials}</p>
      </div>
    </div>
  );
}

export function MockFlashcard({ className, auto = true }: { className?: string; auto?: boolean }) {
  const { t } = useI18n();
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setFlipped((f) => !f), 2800);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className={clsx("flip-card h-36 w-60", className)} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <div className={clsx("flip-inner relative h-full w-full", flipped && "flipped")}>
        <div className="flip-face absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 p-4 text-center text-xl font-bold text-white shadow-2xl shadow-orange-900/20">
          {t.landing.mock.flashFront}
        </div>
        <div className="flip-face flip-back absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-amber-300 bg-white p-4 text-center text-sm text-slate-700 shadow-2xl">
          {t.landing.mock.flashBack}
        </div>
      </div>
    </div>
  );
}

export function MockQuestion({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={clsx("w-64 rounded-2xl bg-white p-4 shadow-2xl shadow-emerald-900/15", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <ClipboardCheck size={16} />
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
          {t.landing.mock.score} 90%
        </span>
      </div>
      <p className="mb-3 text-sm font-semibold text-slate-800">{t.landing.mock.question}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center justify-center gap-1 rounded-lg border-2 border-emerald-500 bg-emerald-50 py-1.5 font-medium text-emerald-700">
          <Check size={14} /> {t.landing.mock.yes}
        </span>
        <span className="rounded-lg border-2 border-slate-100 py-1.5 text-center text-slate-400">{t.landing.mock.no}</span>
      </div>
    </div>
  );
}

export function MockSummary({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={clsx("w-72 rounded-2xl bg-white p-4 shadow-2xl shadow-sky-900/15", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <BookOpenText size={16} />
        </span>
        <p className="text-sm font-bold text-violet-700">{t.landing.mock.summaryTitle}</p>
      </div>
      <div className="mb-3 flex gap-1.5">
        {t.landing.mock.styles.map((s, i) => (
          <span
            key={s}
            className={clsx(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              i === 0 ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600",
            )}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {[100, 85, 92, 60].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-slate-100"
            initial={{ width: 0 }}
            animate={{ width: `${w}%` }}
            transition={{ delay: 0.5 + 0.15 * i, duration: 0.6 }}
          />
        ))}
      </div>
    </div>
  );
}

export function MockChat({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={clsx("w-72 space-y-2 rounded-2xl bg-white p-4 shadow-2xl shadow-pink-900/15", className)}>
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-ee-md bg-gradient-to-br from-pink-400 to-fuchsia-500 px-3 py-2 text-sm text-white">
          {t.landing.mock.chatQ}
        </p>
      </div>
      <div className="flex justify-start">
        <p className="max-w-[90%] rounded-2xl rounded-es-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
          {t.landing.mock.chatA}
        </p>
      </div>
    </div>
  );
}

/** Bigger feature illustrations used in the scrolling sections. */
export function FeatureIllustration({ type }: { type: "summary" | "flashcards" | "test" | "chat" }) {
  const { t } = useI18n();
  const bg = {
    summary: "from-sky-100 via-blue-50 to-white",
    flashcards: "from-amber-100 via-orange-50 to-white",
    test: "from-emerald-100 via-teal-50 to-white",
    chat: "from-pink-100 via-fuchsia-50 to-white",
  }[type];

  return (
    <div className={clsx("relative flex h-80 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br p-6", bg)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.12)_1px,transparent_0)] [background-size:20px_20px]" />
      {type === "summary" && (
        <div className="relative">
          <MockSummary />
          <motion.div
            className="absolute -top-5 -end-6 flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles size={12} /> AI
          </motion.div>
        </div>
      )}
      {type === "flashcards" && (
        <div className="relative">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-6 rounded-2xl bg-orange-200" />
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-3 rounded-2xl bg-amber-200" />
          <MockFlashcard />
        </div>
      )}
      {type === "test" && (
        <div className="relative">
          <MockQuestion />
          <div className="absolute -bottom-10 -start-10 w-48 rounded-2xl bg-white p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {t.landing.mock.options.map((o, i) => (
                <span
                  key={o}
                  className={clsx(
                    "rounded-md border px-2 py-1",
                    i === 0 ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-500",
                  )}
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {type === "chat" && <MockChat />}
    </div>
  );
}

export const FEATURE_ICON = {
  summary: { icon: BookOpenText, gradient: "from-sky-400 to-blue-500" },
  flashcards: { icon: Layers, gradient: "from-amber-300 to-orange-500" },
  test: { icon: ClipboardCheck, gradient: "from-emerald-300 to-teal-500" },
  chat: { icon: MessageCircle, gradient: "from-pink-400 to-fuchsia-500" },
} as const;
