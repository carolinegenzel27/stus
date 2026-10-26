"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { Course, Folder, Material, Product, ProductType } from "@/lib/types";
import { Header } from "@/components/Header";
import { MaterialsPanel } from "./MaterialsPanel";
import { ActionsPanel } from "./ActionsPanel";
import { ProductFeed } from "./ProductFeed";
import { OptionsDialog } from "./dialogs/OptionsDialog";
import { ProductViewer } from "./viewers/ProductViewer";

export type Pending = { key: string; type: ProductType };

export function CourseWorkspace({
  course,
  initialMaterials,
  initialFolders,
  initialProducts,
}: {
  course: Course;
  initialMaterials: Material[];
  initialFolders: Folder[];
  initialProducts: Product[];
}) {
  const { t, locale } = useI18n();
  const [materials, setMaterials] = useState(initialMaterials);
  const [folders, setFolders] = useState(initialFolders);
  const [products, setProducts] = useState(initialProducts);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dialog, setDialog] = useState<Exclude<ProductType, "chat"> | null>(null);
  const [viewing, setViewing] = useState<Product | "new-chat" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"materials" | "feed" | "actions">("feed");

  const selectedIds = useMemo(() => materials.filter((m) => m.selected).map((m) => m.id), [materials]);

  async function generate(type: Exclude<ProductType, "chat">, options: object) {
    setDialog(null);
    setError(null);
    setTab("feed");
    const key = crypto.randomUUID();
    setPending((p) => [{ key, type }, ...p]);
    try {
      const endpoint = type === "summary" ? "summarize" : type;
      const res = await fetch(`/api/ai/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, materialIds: selectedIds, options }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.common.error);
      setProducts((p) => [data.product, ...p]);
      setViewing(data.product);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setPending((p) => p.filter((x) => x.key !== key));
    }
  }

  const BackIcon = locale === "he" ? ChevronRight : ChevronLeft;

  return (
    <>
      <Header>
        <div className="flex min-w-0 items-center gap-2 text-slate-600">
          <Link href="/" className="hidden sm:flex items-center gap-1 rounded-lg px-2 py-1 text-sm hover:bg-violet-100">
            <BackIcon size={16} />
            {t.course.backHome}
          </Link>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="truncate font-bold text-slate-800">
            {course.emoji && <span className="me-1">{course.emoji}</span>}
            {course.name}
          </span>
        </div>
      </Header>

      {/* Mobile tabs */}
      <div className="flex gap-1 border-b border-violet-100 bg-white/70 p-2 lg:hidden">
        {(["actions", "feed", "materials"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-medium cursor-pointer",
              tab === k ? "bg-violet-600 text-white" : "text-slate-600",
            )}
          >
            {t.course.tabs[k]}
          </button>
        ))}
      </div>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-5 p-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className={clsx(tab !== "actions" && "hidden", "lg:block")}>
          <ActionsPanel
            disabled={selectedIds.length === 0}
            onAction={(type) => {
              if (type === "chat") setViewing("new-chat");
              else setDialog(type);
            }}
          />
        </aside>

        <section className={clsx(tab !== "feed" && "hidden", "lg:block min-w-0")}>
          {error && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold cursor-pointer">×</button>
            </div>
          )}
          <ProductFeed
            courseId={course.id}
            products={products}
            setProducts={setProducts}
            folders={folders}
            setFolders={setFolders}
            pending={pending}
            onOpen={setViewing}
          />
        </section>

        <aside className={clsx(tab !== "materials" && "hidden", "lg:block")}>
          <MaterialsPanel courseId={course.id} materials={materials} setMaterials={setMaterials} />
        </aside>
      </main>

      <OptionsDialog type={dialog} onClose={() => setDialog(null)} onSubmit={generate} />

      <ProductViewer
        courseId={course.id}
        selectedIds={selectedIds}
        product={viewing}
        onClose={() => setViewing(null)}
        onProductChange={(p) => {
          setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]));
          setViewing(p);
        }}
      />
    </>
  );
}
