import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
});

// Every page is per-user (session + language cookie), so render on request.
export const instant = false;

export const metadata: Metadata = {
  title: "STUS — AI study assistant",
  description: "Your AI private study assistant: summaries, flashcards, tests and chat over your course materials.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={locale === "he" ? "rtl" : "ltr"}
      className={`${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="bg-blobs" aria-hidden />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
