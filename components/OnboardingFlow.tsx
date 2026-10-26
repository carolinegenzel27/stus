"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { fmt, useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/types";
import { Button, Chip, Input, Spinner } from "@/components/ui";
import { LangToggle } from "@/components/LangToggle";

type StudentType = "highschool" | "undergrad" | "grad" | "prep" | "self";
const TYPE_EMOJI: Record<StudentType, string> = {
  highschool: "🏫",
  undergrad: "🎓",
  grad: "🔬",
  prep: "🚀",
  self: "🧭",
};
const GOALS = ["exams", "understand", "memorize", "homework"] as const;
const TOTAL = 5;

export function OnboardingFlow() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [field, setField] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext =
    (step === 1 && studentType) ||
    (step === 2 && year) ||
    (step === 3 && field.trim()) ||
    (step === 4 && goals.length > 0) ||
    step === 5;

  async function finish() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ student_type: studentType, year, field: field.trim(), goals, locale, onboarded: true })
      .eq("id", user!.id);
    if (error) {
      setBusy(false);
      return setError(t.common.error);
    }
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 700);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="absolute top-4 end-4">
        <LangToggle />
      </div>
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800">{t.onboarding.title} 👋</h1>
          <p className="mt-1 text-slate-500">{fmt(t.onboarding.step, { n: step, total: TOTAL })}</p>
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i + 1 <= step ? "w-8 bg-violet-500" : "w-2 bg-violet-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-[320px] rounded-3xl bg-white/90 p-8 shadow-xl shadow-violet-200/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <>
                  <h2 className="mb-5 text-xl font-bold">{t.onboarding.studentType}</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(Object.keys(TYPE_EMOJI) as StudentType[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          setStudentType(k);
                          setYear(null);
                        }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-start transition cursor-pointer ${
                          studentType === k
                            ? "border-violet-500 bg-violet-50 shadow-md"
                            : "border-violet-100 hover:border-violet-300"
                        }`}
                      >
                        <span className="text-3xl">{TYPE_EMOJI[k]}</span>
                        <span className="font-medium">{t.onboarding.types[k]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && studentType && (
                <>
                  <h2 className="mb-5 text-xl font-bold">{t.onboarding.year}</h2>
                  <div className="flex flex-wrap gap-3">
                    {t.onboarding.years[studentType].map((y) => (
                      <Chip key={y} active={year === y} onClick={() => setYear(y)}>
                        {y}
                      </Chip>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="mb-5 text-xl font-bold">{t.onboarding.field}</h2>
                  <Input
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder={t.onboarding.fieldPlaceholder}
                    autoFocus
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.onboarding.fieldChips.map((c) => (
                      <Chip key={c} active={field === c} onClick={() => setField(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="mb-5 text-xl font-bold">{t.onboarding.goals}</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {GOALS.map((g) => (
                      <Chip
                        key={g}
                        className="py-4 text-base"
                        active={goals.includes(g)}
                        onClick={() =>
                          setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
                        }
                      >
                        {t.onboarding.goalOptions[g]}
                      </Chip>
                    ))}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h2 className="mb-5 text-xl font-bold">{t.onboarding.language}</h2>
                  <div className="flex gap-3">
                    {(["en", "he"] as Locale[]).map((l) => (
                      <Chip key={l} className="flex-1 py-4 text-base" active={locale === l} onClick={() => setLocale(l)}>
                        {l === "en" ? "🇬🇧 English" : "🇮🇱 עברית"}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 1 || busy}>
            {t.common.back}
          </Button>
          {step < TOTAL ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              {t.common.next}
            </Button>
          ) : (
            <Button size="lg" onClick={finish} disabled={busy}>
              {busy && <Spinner />}
              {t.onboarding.finish}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
