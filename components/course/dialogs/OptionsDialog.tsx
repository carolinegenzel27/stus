"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { FlashcardOptions, QuestionKind, SummaryOptions, TestOptions } from "@/lib/types";
import { Button, Chip, Input, Label, Modal, Textarea } from "@/components/ui";
import { PRODUCT_STYLE } from "../ActionsPanel";

type DialogType = "summary" | "flashcards" | "test";

export function OptionsDialog({
  type,
  onClose,
  onSubmit,
}: {
  type: DialogType | null;
  onClose: () => void;
  onSubmit: (type: DialogType, options: object) => void;
}) {
  const { t } = useI18n();
  const titles = { summary: t.summary.title, flashcards: t.flashcards.title, test: t.test.title };
  const Icon = type ? PRODUCT_STYLE[type].icon : null;

  return (
    <Modal
      open={!!type}
      onClose={onClose}
      title={
        type &&
        Icon && (
          <span className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${PRODUCT_STYLE[type].soft}`}>
              <Icon size={20} />
            </span>
            {titles[type]}
          </span>
        )
      }
    >
      {type === "summary" && <SummaryForm onSubmit={(o) => onSubmit("summary", o)} />}
      {type === "flashcards" && <FlashcardsForm onSubmit={(o) => onSubmit("flashcards", o)} />}
      {type === "test" && <TestForm onSubmit={(o) => onSubmit("test", o)} />}
    </Modal>
  );
}

function SummaryForm({ onSubmit }: { onSubmit: (o: SummaryOptions) => void }) {
  const { t } = useI18n();
  const [style, setStyle] = useState<SummaryOptions["style"]>("short");
  const [notes, setNotes] = useState("");
  return (
    <div className="space-y-5">
      <div>
        <Label>{t.summary.style}</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(["short", "keywords", "detailed"] as const).map((s) => (
            <Chip key={s} active={style === s} onClick={() => setStyle(s)} className="py-3">
              {t.summary.styles[s]}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>{t.summary.notes}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.summary.notesPlaceholder}
          rows={3}
          maxLength={2000}
        />
      </div>
      <Button size="lg" className="w-full" onClick={() => onSubmit({ style, notes: notes.trim() || undefined })}>
        {t.actions.go}
      </Button>
    </div>
  );
}

function FlashcardsForm({ onSubmit }: { onSubmit: (o: FlashcardOptions) => void }) {
  const { t } = useI18n();
  const [target, setTarget] = useState("");
  const [count, setCount] = useState(10);
  return (
    <div className="space-y-5">
      <div>
        <Label>{t.flashcards.target}</Label>
        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={t.flashcards.targetPlaceholder}
          maxLength={1000}
        />
      </div>
      <div>
        <Label>
          {t.flashcards.count}: <span className="text-violet-600">{count}</span>
        </Label>
        <input
          type="range"
          min={1}
          max={30}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-violet-600"
        />
        <div className="mt-2 flex gap-2">
          {[5, 10, 20, 30].map((n) => (
            <Chip key={n} active={count === n} onClick={() => setCount(n)} className="flex-1 py-1.5">
              {n}
            </Chip>
          ))}
        </div>
      </div>
      <Button size="lg" className="w-full" onClick={() => onSubmit({ target: target.trim() || undefined, count })}>
        {t.actions.go}
      </Button>
    </div>
  );
}

function TestForm({ onSubmit }: { onSubmit: (o: TestOptions) => void }) {
  const { t } = useI18n();
  const [count, setCount] = useState<TestOptions["count"]>(10);
  const [difficulty, setDifficulty] = useState<TestOptions["difficulty"]>("medium");
  const [kinds, setKinds] = useState<QuestionKind[]>(["mc"]);
  const toggle = (k: QuestionKind) =>
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <div className="space-y-5">
      <div>
        <Label>{t.test.count}</Label>
        <div className="flex gap-2">
          {([5, 10, 20] as const).map((n) => (
            <Chip key={n} active={count === n} onClick={() => setCount(n)} className="flex-1">
              {n}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>{t.test.difficulty}</Label>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)} className="flex-1">
              {t.test.difficulties[d]}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>{t.test.kinds}</Label>
        <div className="flex flex-wrap gap-2">
          {(["yesno", "mc", "open"] as const).map((k) => (
            <Chip key={k} active={kinds.includes(k)} onClick={() => toggle(k)} className="flex-1">
              {t.test.kindOptions[k]}
            </Chip>
          ))}
        </div>
        {kinds.length === 0 && <p className="mt-2 text-xs text-rose-500">{t.test.pickKind}</p>}
      </div>
      <Button size="lg" className="w-full" disabled={!kinds.length} onClick={() => onSubmit({ count, difficulty, kinds })}>
        {t.actions.go}
      </Button>
    </div>
  );
}
