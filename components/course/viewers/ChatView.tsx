"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { ChatMessage, Product } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";
import { Markdown } from "./Markdown";

export function ChatView({
  courseId,
  selectedIds,
  product,
  initial,
  onCreated,
}: {
  courseId: string;
  selectedIds: string[];
  product: Product | null;
  initial: ChatMessage[];
  onCreated: (p: Product) => void;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const productRef = useRef(product);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          materialIds: productRef.current?.material_ids ?? selectedIds,
          productId: productRef.current?.id,
          message: text,
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t.common.error);
      }

      const id = res.headers.get("X-Product-Id");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }

      const finalMessages: ChatMessage[] = [...history, { role: "assistant", content: reply }];
      const base: Product = productRef.current ?? {
        id: id!,
        course_id: courseId,
        folder_id: null,
        type: "chat",
        title: text.slice(0, 80),
        options: {},
        material_ids: selectedIds,
        created_at: new Date().toISOString(),
        content: { messages: [] },
      };
      const updated = { ...base, content: { messages: finalMessages } };
      productRef.current = updated;
      onCreated(updated);
    } catch (e) {
      setMessages([...history, { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : t.common.error}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[65vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pe-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <span className="mb-2 text-5xl">💬</span>
            {t.chat.intro}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={clsx(
                "max-w-[85%] rounded-2xl px-4 py-2.5",
                m.role === "user"
                  ? "bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white rounded-ee-md"
                  : "bg-slate-100 text-slate-800 rounded-es-md",
              )}
            >
              {m.role === "assistant" ? (
                m.content ? <Markdown>{m.content}</Markdown> : <Spinner className="text-fuchsia-500" />
              ) : (
                <p className="whitespace-pre-wrap" dir="auto">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t.chat.placeholder}
          rows={1}
          dir="auto"
          className="max-h-32 flex-1 resize-none rounded-xl border border-violet-200 px-4 py-2.5 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
        />
        <Button type="submit" disabled={busy || !input.trim()} aria-label={t.chat.send}>
          <Send size={18} className="rtl:-scale-x-100" />
        </Button>
      </form>
    </div>
  );
}
