"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { fmt, useI18n } from "@/lib/i18n/provider";
import type { FlashcardContent } from "@/lib/types";
import { Button } from "@/components/ui";

export function FlashcardsView({ content }: { content: FlashcardContent }) {
  const { t, locale } = useI18n();
  const [order, setOrder] = useState(() => content.cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = content.cards[order[pos]];
  const go = (d: number) => {
    setFlipped(false);
    setPos((p) => (p + d + order.length) % order.length);
  };

  function mark(isKnown: boolean) {
    const next = new Set(known);
    if (isKnown) next.add(order[pos]);
    else next.delete(order[pos]);
    setKnown(next);
    if (isKnown && next.size === content.cards.length) confetti({ particleCount: 150, spread: 90 });
    go(1);
  }

  const Prev = locale === "he" ? ChevronRight : ChevronLeft;
  const Next = locale === "he" ? ChevronLeft : ChevronRight;

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <span>
          {pos + 1} / {order.length}
        </span>
        <span>{fmt(t.flashcards.progress, { known: known.size, left: content.cards.length - known.size })}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOrder((o) => [...o].sort(() => Math.random() - 0.5));
            setPos(0);
            setFlipped(false);
          }}
        >
          <Shuffle size={14} /> {t.flashcards.shuffle}
        </Button>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
          style={{ width: `${(known.size / content.cards.length) * 100}%` }}
        />
      </div>

      <div className="flip-card h-72 cursor-pointer" onClick={() => setFlipped((f) => !f)}>
        <div className={clsx("flip-inner relative h-full w-full", flipped && "flipped")}>
          <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 p-8 text-center text-white shadow-xl">
            {known.has(order[pos]) && <span className="absolute top-4 end-4 text-xl">✅</span>}
            <p className="text-2xl font-bold" dir="auto">
              {card.front}
            </p>
            <p className="absolute bottom-4 text-xs text-white/75">{t.flashcards.flip}</p>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex items-center justify-center overflow-y-auto rounded-3xl border-4 border-amber-300 bg-white p-8 text-center shadow-xl">
            <p className="text-lg text-slate-700" dir="auto">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => go(-1)} aria-label="Previous">
          <Prev />
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => mark(false)}>
            {t.flashcards.learning}
          </Button>
          <Button onClick={() => mark(true)}>{t.flashcards.know}</Button>
        </div>
        <Button variant="ghost" onClick={() => go(1)} aria-label="Next">
          <Next />
        </Button>
      </div>
    </div>
  );
}
