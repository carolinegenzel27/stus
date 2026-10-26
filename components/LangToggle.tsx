"use client";

import { useI18n } from "@/lib/i18n/provider";

export function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex rounded-full bg-white/80 p-1 text-sm shadow-sm border border-violet-100">
      {(["en", "he"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
            locale === l ? "bg-violet-600 text-white" : "text-slate-600 hover:text-violet-700"
          }`}
        >
          {l === "en" ? "EN" : "עב"}
        </button>
      ))}
    </div>
  );
}
