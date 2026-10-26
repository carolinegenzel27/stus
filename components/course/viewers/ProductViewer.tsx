"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { ChatContent, FlashcardContent, Product, SummaryContent, TestContent } from "@/lib/types";
import { Modal } from "@/components/ui";
import { PRODUCT_STYLE } from "../ActionsPanel";
import type { Credits } from "../CourseWorkspace";
import { SummaryView } from "./SummaryView";
import { FlashcardsView } from "./FlashcardsView";
import { TestView } from "./TestView";
import { ChatView } from "./ChatView";

export function ProductViewer({
  courseId,
  selectedIds,
  product,
  onClose,
  onProductChange,
  credits,
  onCreditsLeft,
}: {
  courseId: string;
  selectedIds: string[];
  product: Product | "new-chat" | null;
  onClose: () => void;
  onProductChange: (p: Product) => void;
  credits: Credits | null;
  onCreditsLeft: (left: number) => void;
}) {
  const { t } = useI18n();
  const type = product === "new-chat" ? "chat" : product?.type;
  const style = type ? PRODUCT_STYLE[type] : null;
  const title = product === "new-chat" ? t.chat.title : product?.title;

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      wide
      title={
        style && (
          <span className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white`}>
              <style.icon size={20} />
            </span>
            <span className="min-w-0 truncate">{title}</span>
          </span>
        )
      }
    >
      {product && product !== "new-chat" && product.type === "summary" && (
        <SummaryView content={product.content as SummaryContent} />
      )}
      {product && product !== "new-chat" && product.type === "flashcards" && (
        <FlashcardsView key={product.id} content={product.content as FlashcardContent} />
      )}
      {product && product !== "new-chat" && product.type === "test" && (
        <TestView key={product.id} product={product} content={product.content as TestContent} onChange={onProductChange} />
      )}
      {product && type === "chat" && (
        <ChatView
          key={product === "new-chat" ? "new" : product.id}
          courseId={courseId}
          selectedIds={selectedIds}
          product={product === "new-chat" ? null : product}
          initial={product === "new-chat" ? [] : (product.content as ChatContent).messages}
          onCreated={onProductChange}
          creditLimit={credits?.limit ?? null}
          onCreditsLeft={onCreditsLeft}
        />
      )}
    </Modal>
  );
}
