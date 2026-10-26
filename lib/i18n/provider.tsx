"use client";

import { createContext, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";
import { en, type Dict } from "./en";
import { he } from "./he";

const dicts = { en, he };

type Ctx = { locale: Locale; t: Dict; setLocale: (l: Locale) => void };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `stus_locale=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      document.documentElement.dir = l === "he" ? "rtl" : "ltr";
      router.refresh();
    },
    [router],
  );
  return (
    <I18nContext.Provider value={{ locale, t: dicts[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Replaces {key} placeholders: fmt("{n} left", { n: 3 }) */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
