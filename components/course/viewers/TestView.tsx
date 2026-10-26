"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import clsx from "clsx";
import { CheckCircle2, XCircle } from "lucide-react";
import { fmt, useI18n } from "@/lib/i18n/provider";
import type { Product, TestContent, TestResult } from "@/lib/types";
import { Button, Spinner, Textarea } from "@/components/ui";

export function TestView({
  product,
  content,
  onChange,
}: {
  product: Product;
  content: TestContent;
  onChange: (p: Product) => void;
}) {
  const { t } = useI18n();
  const { questions } = content;
  const [result, setResult] = useState<TestResult | undefined>(content.result);
  const [answers, setAnswers] = useState<string[]>(() => content.result?.answers ?? questions.map(() => ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unanswered = answers.filter((a) => !a.trim()).length;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      onChange({ ...product, content: { ...content, result: data.result } });
      if (data.result.score >= 80) confetti({ particleCount: 160, spread: 90 });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {result && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-500 p-5 text-white">
          <div>
            <p className="text-sm text-white/85">{t.test.score}</p>
            <p className="text-4xl font-extrabold">{result.score}%</p>
          </div>
          <span className="text-5xl">{result.score >= 80 ? "🏆" : result.score >= 50 ? "💪" : "📚"}</span>
          <Button
            variant="secondary"
            onClick={() => {
              setResult(undefined);
              setAnswers(questions.map(() => ""));
            }}
          >
            {t.test.retake}
          </Button>
        </div>
      )}

      {questions.map((q, i) => {
        const graded = result !== undefined;
        const ok = result?.correct[i];
        return (
          <div
            key={i}
            className={clsx(
              "rounded-2xl border-2 p-4",
              !graded && "border-slate-100",
              graded && ok && "border-emerald-300 bg-emerald-50/50",
              graded && !ok && "border-rose-300 bg-rose-50/50",
            )}
          >
            <p className="mb-3 font-semibold text-slate-800" dir="auto">
              <span className="me-2 text-violet-500">{i + 1}.</span>
              {q.question}
            </p>

            {q.kind === "open" ? (
              <Textarea
                value={answers[i]}
                disabled={graded}
                onChange={(e) => setAnswers((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={t.test.answerPlaceholder}
                rows={3}
                dir="auto"
              />
            ) : (
              <div className={clsx("grid gap-2", q.kind === "mc" ? "sm:grid-cols-2" : "grid-cols-2")}>
                {q.options.map((opt) => {
                  const chosen = answers[i] === opt;
                  const isAnswer = graded && opt === q.answer;
                  return (
                    <button
                      key={opt}
                      disabled={graded}
                      onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? opt : x)))}
                      dir="auto"
                      className={clsx(
                        "rounded-xl border-2 px-4 py-2.5 text-start text-sm transition cursor-pointer disabled:cursor-default",
                        isAnswer && "border-emerald-500 bg-emerald-100",
                        graded && chosen && !isAnswer && "border-rose-400 bg-rose-100",
                        !graded && chosen && "border-violet-500 bg-violet-100",
                        !graded && !chosen && "border-slate-200 hover:border-violet-300",
                        graded && !chosen && !isAnswer && "border-slate-100 opacity-60",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {graded && (
              <div className="mt-3 flex gap-2 text-sm">
                {ok ? (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                ) : (
                  <XCircle size={18} className="shrink-0 text-rose-500" />
                )}
                <div dir="auto">
                  <span className={clsx("font-semibold", ok ? "text-emerald-700" : "text-rose-600")}>
                    {ok ? t.test.correct : t.test.wrong}
                  </span>
                  {q.kind === "open" && (
                    <p className="mt-1 text-slate-600">
                      <span className="font-medium">{t.test.correctAnswer}:</span> {q.answer}
                    </p>
                  )}
                  <p className="mt-1 text-slate-600">{result.feedback[i]}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {!result && (
        <div className="sticky bottom-0 -mx-6 -mb-6 bg-white/95 p-4 backdrop-blur">
          <Button size="lg" className="w-full" disabled={busy || unanswered > 0} onClick={submit}>
            {busy ? (
              <>
                <Spinner /> {t.test.grading}
              </>
            ) : unanswered > 0 ? (
              fmt(t.test.unanswered, { n: unanswered })
            ) : (
              t.test.submit
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
