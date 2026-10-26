"use client";

import { motion } from "framer-motion";
import { BookOpenText, ClipboardCheck, Layers, MessageCircle, Zap } from "lucide-react";
import { fmt, useI18n } from "@/lib/i18n/provider";
import type { ProductType } from "@/lib/types";
import { Panel } from "./Panel";
import type { Credits } from "./CourseWorkspace";

export const PRODUCT_STYLE: Record<ProductType, { icon: typeof Layers; gradient: string; soft: string }> = {
  summary: { icon: BookOpenText, gradient: "from-sky-400 to-blue-500", soft: "bg-sky-100 text-sky-600" },
  flashcards: { icon: Layers, gradient: "from-amber-300 to-orange-500", soft: "bg-amber-100 text-amber-600" },
  test: { icon: ClipboardCheck, gradient: "from-emerald-300 to-teal-500", soft: "bg-emerald-100 text-emerald-600" },
  chat: { icon: MessageCircle, gradient: "from-pink-400 to-fuchsia-500", soft: "bg-pink-100 text-pink-600" },
};

export function ActionsPanel({
  disabled,
  credits,
  onAction,
}: {
  disabled: boolean;
  credits: Credits | null;
  onAction: (t: ProductType) => void;
}) {
  const { t } = useI18n();
  const out = credits !== null && credits.left <= 0;
  const items: { type: ProductType; label: string; desc: string }[] = [
    { type: "summary", label: t.actions.summary, desc: t.actions.summaryDesc },
    { type: "flashcards", label: t.actions.flashcards, desc: t.actions.flashcardsDesc },
    { type: "test", label: t.actions.test, desc: t.actions.testDesc },
    { type: "chat", label: t.actions.chat, desc: t.actions.chatDesc },
  ];

  return (
    <Panel title={t.course.actions}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {items.map(({ type, label, desc }, i) => {
          const { icon: Icon, gradient } = PRODUCT_STYLE[type];
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={disabled ? undefined : { scale: 1.03 }}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              disabled={disabled}
              onClick={() => onAction(type)}
              className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${gradient} p-4 text-start text-white shadow-md transition disabled:opacity-40 disabled:grayscale cursor-pointer disabled:cursor-not-allowed`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/25">
                <Icon size={22} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{label}</span>
                <span className="block truncate text-xs text-white/85">{desc}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      {disabled && !out && <p className="mt-3 text-center text-xs text-slate-400">{t.course.actionsHint}</p>}
      {credits && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Zap size={13} className={out ? "text-rose-500" : "text-amber-500"} />
            {out ? fmt(t.limit.reached, { total: credits.limit }) : fmt(t.limit.left, { n: credits.left, total: credits.limit })}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div
              className={`h-full rounded-full transition-all ${out ? "bg-rose-400" : "bg-gradient-to-r from-amber-400 to-violet-500"}`}
              style={{ width: `${Math.max(0, (credits.left / credits.limit) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </Panel>
  );
}
