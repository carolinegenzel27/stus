"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { Button, Input, Label, Modal, Spinner } from "@/components/ui";

const EMOJIS = [
  "📚", "📐", "🧮", "🧪", "🧬", "🔭", "💻", "🤖", "🧠", "📊",
  "🌍", "🏛️", "⚖️", "💼", "🎨", "🎵", "📝", "🗣️", "🩺", "⚙️",
  "🌱", "⚛️", "📈", "🧾", "✏️", "🦉", "🚀", "💡", "🔥", "⭐",
];

export function CourseDialog({
  open,
  onClose,
  onSubmit,
  initial,
  title,
  allowSkip,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, emoji: string | null) => Promise<void>;
  initial?: { name: string; emoji: string | null };
  title: string;
  allowSkip?: boolean;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset the form each time the dialog opens.
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(initial?.name ?? "");
      setEmoji(initial?.emoji ?? null);
      setBusy(false);
    }
  }

  async function submit(n: string, e: string | null) {
    setBusy(true);
    try {
      await onSubmit(n, e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(name, emoji);
        }}
        className="space-y-5"
      >
        <div>
          <Label>{t.dashboard.courseName}</Label>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl">
              {emoji ?? "＋"}
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.dashboard.courseNamePlaceholder}
              maxLength={80}
              autoFocus
            />
          </div>
        </div>
        <div>
          <Label>{t.dashboard.pickEmoji}</Label>
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(emoji === e ? null : e)}
                className={`aspect-square rounded-lg text-xl transition hover:scale-125 cursor-pointer ${
                  emoji === e ? "bg-violet-200 ring-2 ring-violet-500" : "hover:bg-violet-50"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {allowSkip && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => submit("", null)}>
              {t.common.skip}
            </Button>
          )}
          <Button type="submit" disabled={busy || (!allowSkip && !name.trim())}>
            {busy && <Spinner />}
            {initial ? t.common.save : t.common.create}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
