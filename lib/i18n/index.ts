import { cookies } from "next/headers";
import type { Locale } from "@/lib/types";
import { en } from "./en";
import { he } from "./he";

export const dictionaries = { en, he };
export const LOCALE_COOKIE = "stus_locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "he" ? "he" : "en";
}
