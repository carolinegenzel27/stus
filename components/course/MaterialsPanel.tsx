"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Check, ClipboardPaste, FileText, FileType, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fmt, useI18n } from "@/lib/i18n/provider";
import { useHydrated } from "@/lib/useHydrated";
import type { Material } from "@/lib/types";
import { Button, Input, Modal, Spinner, Textarea } from "@/components/ui";
import { Panel } from "./Panel";

export function MaterialsPanel({
  courseId,
  materials,
  setMaterials,
}: {
  courseId: string;
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}) {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function send(form: FormData) {
    form.set("courseId", courseId);
    setUploading((n) => n + 1);
    try {
      const res = await fetch("/api/materials/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMaterials((m) => [data.material, ...m]);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
      return false;
    } finally {
      setUploading((n) => n - 1);
    }
  }

  function uploadFiles(files: FileList | null) {
    setError(null);
    Array.from(files ?? []).forEach((file) => {
      const form = new FormData();
      form.set("file", file);
      send(form);
    });
  }

  async function setSelected(ids: string[], selected: boolean) {
    setMaterials((list) => list.map((m) => (ids.includes(m.id) ? { ...m, selected } : m)));
    await supabase.from("materials").update({ selected }).in("id", ids);
  }

  async function remove(m: Material) {
    if (!confirm(t.common.confirmDelete)) return;
    setMaterials((list) => list.filter((x) => x.id !== m.id));
    const { data } = await supabase.from("materials").delete().eq("id", m.id).select("storage_path").single();
    if (data?.storage_path) await supabase.storage.from("materials").remove([data.storage_path]);
  }

  const selectedCount = materials.filter((m) => m.selected).length;

  return (
    <Panel
      title={t.course.materials}
      extra={
        materials.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="me-1 text-slate-400">{fmt(t.course.selectedCount, { n: selectedCount })}</span>
            <button
              className="rounded-md px-2 py-1 text-violet-600 hover:bg-violet-50 cursor-pointer"
              onClick={() => setSelected(materials.map((m) => m.id), true)}
            >
              {t.course.selectAll}
            </button>
            <button
              className="rounded-md px-2 py-1 text-violet-600 hover:bg-violet-50 cursor-pointer"
              onClick={() => setSelected(materials.map((m) => m.id), false)}
            >
              {t.course.selectNone}
            </button>
          </div>
        )
      }
    >
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center text-sm transition",
          dragOver ? "border-violet-500 bg-violet-50" : "border-violet-200 hover:border-violet-400 hover:bg-violet-50/50",
        )}
      >
        {uploading > 0 ? <Spinner className="h-6 w-6 text-violet-500" /> : <Upload className="text-violet-500" />}
        <span className="font-medium text-slate-700">{uploading > 0 ? t.course.uploading : t.course.upload}</span>
        <span className="text-xs text-slate-400">{t.course.dropHere}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain"
          multiple
          hidden
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => setPasteOpen(true)}>
        <ClipboardPaste size={16} /> {t.course.pasteText}
      </Button>

      {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

      <ul className="mt-4 space-y-2 lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto">
        <AnimatePresence initial={false}>
          {materials.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={clsx(
                "group flex items-center gap-3 rounded-2xl border-2 p-3 transition",
                m.selected ? "border-violet-400 bg-violet-50" : "border-transparent bg-slate-50",
              )}
            >
              <button
                onClick={() => setSelected([m.id], !m.selected)}
                aria-pressed={m.selected}
                aria-label="Select material"
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition cursor-pointer",
                  m.selected ? "border-violet-500 bg-violet-500 text-white" : "border-slate-300 bg-white",
                )}
              >
                {m.selected && <Check size={14} strokeWidth={3} />}
              </button>
              {m.kind === "pdf" ? (
                <FileType size={18} className="shrink-0 text-rose-400" />
              ) : (
                <FileText size={18} className="shrink-0 text-sky-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800" title={m.title}>
                  {m.title}
                </p>
                <p className="text-xs text-slate-400">
                  {m.char_count.toLocaleString("en-US")} chars
                  {hydrated && ` · ${new Date(m.created_at).toLocaleDateString(locale === "he" ? "he-IL" : "en-US")}`}
                </p>
              </div>
              <button
                onClick={() => remove(m)}
                className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                aria-label={t.common.delete}
              >
                <Trash2 size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {materials.length === 0 && <p className="mt-4 text-center text-sm text-slate-400">{t.course.noMaterials} 📄</p>}

      <PasteDialog
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onSubmit={async (title, text) => {
          const form = new FormData();
          form.set("title", title);
          form.set("text", text);
          if (await send(form)) setPasteOpen(false);
        }}
      />
    </Panel>
  );
}

function PasteDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, text: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={t.course.pasteText} wide>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSubmit(title, text);
          setBusy(false);
          setTitle("");
          setText("");
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.course.pasteTitle} />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.course.pastePlaceholder}
          rows={12}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || !text.trim()}>
            {busy && <Spinner />}
            {t.course.addText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
