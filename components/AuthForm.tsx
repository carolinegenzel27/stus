"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { USERNAME_RE, usernameToEmail } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/provider";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { LangToggle } from "@/components/LangToggle";
import { MockFlashcard, MockQuestion } from "@/components/landing/Mocks";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = username.trim().toLowerCase();
    const supabase = createClient();

    if (mode === "signup") {
      if (!USERNAME_RE.test(name)) return setError(t.auth.usernameRules);
      if (password.length < 6) return setError(t.auth.passwordRules);
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data: available } = await supabase.rpc("username_available", { name });
        if (available === false) return setError(t.auth.usernameTaken);
        const { error } = await supabase.auth.signUp({
          email: usernameToEmail(name),
          password,
          options: { data: { username: name } },
        });
        if (error) return setError(error.message);
        router.replace("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: usernameToEmail(name),
          password,
        });
        if (error) return setError(t.auth.invalidLogin);
        router.replace("/");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const Back = locale === "he" ? ArrowRight : ArrowLeft;

  return (
    <main className="grid min-h-[100svh] w-full lg:grid-cols-2">
      {/* Brand side */}
      <section className="relative isolate hidden overflow-hidden bg-[#0e0a1f] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-32 start-[-20%] -z-10 h-[30rem] w-[30rem] rounded-full bg-violet-600/40 blur-[120px]" />
        <div className="absolute bottom-[-10rem] end-[-15%] -z-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/30 blur-[120px]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl">🎓</span>
          <span className="text-2xl font-extrabold">STUS</span>
        </Link>

        <div className="my-auto">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">{t.authSide.title}</h2>
          <ul className="mt-8 space-y-3">
            {t.authSide.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-fuchsia-300">
                  <Check size={14} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="relative mt-14 h-56">
            <motion.div className="absolute start-0 top-0" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
              <MockFlashcard className="-rotate-3" />
            </motion.div>
            <motion.div className="absolute end-4 top-16" animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <MockQuestion className="rotate-3" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form side */}
      <section className="relative flex flex-col bg-white px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-violet-50 hover:text-violet-700">
            <Back size={16} /> {t.authSide.back}
          </Link>
          <LangToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto my-auto w-full max-w-sm py-10"
        >
          <div className="mb-8 lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl">🎓</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {mode === "login" ? t.auth.welcomeBack : t.auth.createAccount}
          </h1>
          <p className="mt-2 text-slate-500">{t.tagline}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label>{t.auth.username}</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                dir="ltr"
                required
              />
              {mode === "signup" && <p className="mt-1 text-xs text-slate-400">{t.auth.usernameRules}</p>}
            </div>
            <div>
              <Label>{t.auth.password}</Label>
              {/* The field is always LTR, so the eye button sits on its physical right. */}
              <div className="relative" dir="ltr">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  title={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Spinner />}
              {mode === "login" ? t.auth.login : t.auth.signup}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="font-semibold text-violet-600 hover:underline"
            >
              {mode === "login" ? t.auth.signup : t.auth.login}
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
