"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Folder as FolderIcon, FolderInput, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/provider";
import type { Folder, Product } from "@/lib/types";
import { Button, Input, Modal } from "@/components/ui";
import { PRODUCT_STYLE } from "./ActionsPanel";
import type { Pending } from "./CourseWorkspace";

export function ProductFeed({
  courseId,
  products,
  setProducts,
  folders,
  setFolders,
  pending,
  onOpen,
}: {
  courseId: string;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  pending: Pending[];
  onOpen: (p: Product) => void;
}) {
  const { t, locale } = useI18n();
  const supabase = createClient();
  const [active, setActive] = useState<string | null>(null);
  const [folderDialog, setFolderDialog] = useState(false);
  const [renaming, setRenaming] = useState<Product | null>(null);

  const visible = active ? products.filter((p) => p.folder_id === active) : products;
  const groups = groupByDate(visible, locale, t.course.today, t.course.yesterday);

  async function updateProduct(id: string, patch: Partial<Product>) {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase.from("products").update(patch).eq("id", id);
  }

  async function deleteProduct(id: string) {
    if (!confirm(t.common.confirmDelete)) return;
    setProducts((list) => list.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  }

  async function deleteFolder(id: string) {
    if (!confirm(t.common.confirmDelete)) return;
    setFolders((f) => f.filter((x) => x.id !== id));
    setProducts((list) => list.map((p) => (p.folder_id === id ? { ...p, folder_id: null } : p)));
    if (active === id) setActive(null);
    await supabase.from("folders").delete().eq("id", id);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">{t.course.feed}</h2>
      </div>

      {/* Folder bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FolderChip active={active === null} onClick={() => setActive(null)}>
          {t.course.all} <span className="opacity-60">{products.length}</span>
        </FolderChip>
        {folders.map((f) => (
          <FolderChip
            key={f.id}
            active={active === f.id}
            onClick={() => setActive(f.id)}
            onRemove={() => deleteFolder(f.id)}
          >
            <FolderIcon size={14} /> {f.name}{" "}
            <span className="opacity-60">{products.filter((p) => p.folder_id === f.id).length}</span>
          </FolderChip>
        ))}
        <button
          onClick={() => setFolderDialog(true)}
          className="flex items-center gap-1 rounded-full border-2 border-dashed border-violet-300 px-3 py-1.5 text-sm text-violet-600 hover:border-violet-500 cursor-pointer"
        >
          <Plus size={14} /> {t.course.newFolder}
        </button>
      </div>

      <AnimatePresence>
        {pending.map((p) => {
          const { icon: Icon, gradient } = PRODUCT_STYLE[p.type];
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-3 flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm"
            >
              <motion.span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Icon size={22} />
              </motion.span>
              <div className="flex-1">
                <p className="font-semibold text-slate-700">{t.course.generating}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {visible.length === 0 && pending.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-violet-200 bg-white/50 p-12 text-center">
          <div className="mb-3 text-5xl">✨</div>
          <p className="text-slate-500">{t.course.emptyFeed}</p>
        </div>
      )}

      {groups.map(([label, items]) => (
        <div key={label} className="mb-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</h3>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                folders={folders}
                onOpen={() => onOpen(p)}
                onMove={(folderId) => updateProduct(p.id, { folder_id: folderId })}
                onRename={() => setRenaming(p)}
                onDelete={() => deleteProduct(p.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <NameDialog
        open={folderDialog}
        title={t.course.newFolder}
        label={t.course.folderName}
        onClose={() => setFolderDialog(false)}
        onSubmit={async (name) => {
          const { data } = await supabase.from("folders").insert({ course_id: courseId, name }).select("*").single();
          if (data) setFolders((f) => [...f, data as Folder]);
          setFolderDialog(false);
        }}
      />
      <NameDialog
        open={!!renaming}
        title={t.common.rename}
        initial={renaming?.title}
        onClose={() => setRenaming(null)}
        onSubmit={async (title) => {
          if (renaming) await updateProduct(renaming.id, { title });
          setRenaming(null);
        }}
      />
    </div>
  );
}

function FolderChip({
  active,
  onClick,
  onRemove,
  children,
}: {
  active: boolean;
  onClick: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "group flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "bg-white text-slate-600 hover:bg-violet-50",
      )}
    >
      <button onClick={onClick} className="flex items-center gap-1.5 cursor-pointer">
        {children}
      </button>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ms-0.5 hidden rounded-full p-0.5 opacity-70 hover:opacity-100 group-hover:block cursor-pointer"
          aria-label="Delete folder"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

function ProductCard({
  product,
  folders,
  onOpen,
  onMove,
  onRename,
  onDelete,
}: {
  product: Product;
  folders: Folder[];
  onOpen: () => void;
  onMove: (folderId: string | null) => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const [menu, setMenu] = useState<"main" | "move" | null>(null);
  const { icon: Icon, gradient } = PRODUCT_STYLE[product.type];
  const folder = folders.find((f) => f.id === product.folder_id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-start shadow-sm transition hover:shadow-lg hover:shadow-violet-100 cursor-pointer"
      >
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
          <Icon size={22} />
        </span>
        <span className="min-w-0 flex-1 pe-6">
          <span className="block truncate font-semibold text-slate-800">{product.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            <span>{t.product[product.type]}</span>
            <span>·</span>
            <span>{new Date(product.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {describe(product, t) && (
              <>
                <span>·</span>
                <span>{describe(product, t)}</span>
              </>
            )}
            {folder && (
              <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 text-violet-600">
                <FolderIcon size={10} /> {folder.name}
              </span>
            )}
          </span>
        </span>
      </button>

      <div className="absolute top-3 end-2">
        <button
          onClick={() => setMenu(menu ? null : "main")}
          className="rounded-full p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
          aria-label="Menu"
        >
          <MoreVertical size={18} />
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
            <div className="absolute end-0 z-20 mt-1 w-52 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-violet-100">
              {menu === "main" ? (
                <>
                  <MenuItem onClick={() => setMenu("move")}>
                    <FolderInput size={14} /> {t.course.moveTo}
                  </MenuItem>
                  <MenuItem onClick={() => { setMenu(null); onRename(); }}>
                    <Pencil size={14} /> {t.common.rename}
                  </MenuItem>
                  <MenuItem danger onClick={() => { setMenu(null); onDelete(); }}>
                    <Trash2 size={14} /> {t.common.delete}
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => { setMenu(null); onMove(null); }} active={!product.folder_id}>
                    {t.course.noFolder}
                  </MenuItem>
                  {folders.map((f) => (
                    <MenuItem key={f.id} active={product.folder_id === f.id} onClick={() => { setMenu(null); onMove(f.id); }}>
                      <FolderIcon size={14} /> {f.name}
                    </MenuItem>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function MenuItem({
  onClick,
  children,
  danger,
  active,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 px-3 py-2 text-start text-sm cursor-pointer",
        danger ? "text-rose-600 hover:bg-rose-50" : "hover:bg-violet-50",
        active && "font-semibold text-violet-700",
      )}
    >
      {children}
    </button>
  );
}

function NameDialog({
  open,
  title,
  label,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  label?: string;
  initial?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setName(initial ?? "");
  }
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim()) await onSubmit(name.trim().slice(0, 80));
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={label} autoFocus maxLength={80} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function describe(p: Product, t: ReturnType<typeof useI18n>["t"]) {
  const o = p.options as Record<string, unknown>;
  if (p.type === "summary") return t.summary.styles[o.style as "short"] ?? "";
  if (p.type === "flashcards") return `${(p.content as { cards: unknown[] }).cards?.length ?? 0} 🃏`;
  if (p.type === "test") {
    const result = (p.content as { result?: { score: number } }).result;
    return `${o.count}Q · ${t.test.difficulties[o.difficulty as "easy"]}${result ? ` · ${result.score}%` : ""}`;
  }
  return "";
}

function groupByDate(products: Product[], locale: string, today: string, yesterday: string) {
  const fmt = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const dayKey = (d: Date) => d.toDateString();
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);

  const map = new Map<string, Product[]>();
  for (const p of products) {
    const d = new Date(p.created_at);
    const label =
      dayKey(d) === dayKey(now) ? today : dayKey(d) === dayKey(yest) ? yesterday : fmt.format(d);
    map.set(label, [...(map.get(label) ?? []), p]);
  }
  return [...map.entries()];
}
