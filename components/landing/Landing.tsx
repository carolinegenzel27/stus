"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { LangToggle } from "@/components/LangToggle";
import { FEATURE_ICON, FeatureIllustration, MockChat, MockCourseCard, MockFlashcard, MockQuestion, MockSummary } from "./Mocks";

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function Landing() {
  const { t, locale } = useI18n();
  const L = t.landing;
  const Arrow = locale === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <Nav />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0e0a1f] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 start-[-10%] h-[38rem] w-[38rem] rounded-full bg-violet-600/40 blur-[120px]" />
          <div className="absolute top-20 end-[-10%] h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/30 blur-[120px]" />
          <div className="absolute bottom-[-12rem] start-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-5 pb-24 pt-32 lg:grid-cols-2 lg:px-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-violet-200 backdrop-blur"
            >
              <Sparkles size={14} className="text-fuchsia-300" /> {L.badge}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {L.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                {L.heroTitle2}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
            >
              {L.heroSub}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-4 text-lg font-semibold shadow-[0_10px_40px_-10px_rgba(192,38,211,0.7)] transition hover:brightness-110"
              >
                {L.ctaPrimary}
                <Arrow size={20} className="transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-4 text-lg font-semibold backdrop-blur transition hover:bg-white/10"
              >
                {L.ctaSecondary}
              </a>
            </motion.div>
            <p className="mt-6 text-sm text-slate-400">{L.trust}</p>
          </div>

          {/* Floating collage of the app */}
          <div className="relative mx-auto hidden h-[520px] w-full max-w-[560px] sm:block">
            <motion.div
              className="absolute start-0 top-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
              transition={{ opacity: { delay: 0.3 }, scale: { delay: 0.3 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            >
              <MockSummary className="-rotate-3" />
            </motion.div>
            <motion.div
              className="absolute end-0 top-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, 10, 0] }}
              transition={{ opacity: { delay: 0.45 }, scale: { delay: 0.45 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            >
              <MockCourseCard className="rotate-6" />
            </motion.div>
            <motion.div
              className="absolute end-6 top-56"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.6 }, scale: { delay: 0.6 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
            >
              <MockFlashcard />
            </motion.div>
            <motion.div
              className="absolute bottom-4 start-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
              transition={{ opacity: { delay: 0.75 }, scale: { delay: 0.75 }, y: { duration: 6.5, repeat: Infinity, ease: "easeInOut" } }}
            >
              <MockQuestion className="rotate-2" />
            </motion.div>
          </div>
        </div>

        <a
          href="#why"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          {L.scroll}
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown size={20} />
          </motion.span>
        </a>
      </section>

      {/* WHY */}
      <section id="why" className="relative px-5 py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <Kicker>{L.whyKicker}</Kicker>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{L.whyTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500">{L.whySub}</p>
          </motion.div>

          {/* Before → after illustration */}
          <motion.div {...reveal} className="mx-auto mt-16 flex max-w-4xl flex-col items-center justify-center gap-6 md:flex-row">
            <div className="relative h-44 w-56">
              {["📄", "📑", "📃", "🗒️", "📄"].map((e, i) => (
                <motion.span
                  key={i}
                  className="absolute flex h-24 w-20 items-center justify-center rounded-xl border border-slate-200 bg-white text-3xl shadow-md"
                  style={{ insetInlineStart: `${i * 28}px`, top: `${(i % 2) * 22}px`, rotate: `${(i - 2) * 7}deg` }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <motion.div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl text-white shadow-xl shadow-violet-300"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎓
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(FEATURE_ICON) as (keyof typeof FEATURE_ICON)[]).map((k, i) => {
                const { icon: Icon, gradient } = FEATURE_ICON[k];
                return (
                  <motion.div
                    key={k}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-slate-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{t.product[k]}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {L.benefits.map((b, i) => (
              <motion.div
                key={b.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.1 }}
                className="group rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-violet-50/50 p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl transition group-hover:scale-110">
                  {b.emoji}
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{b.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-500">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50/70 px-5 py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
            <Kicker>{L.featuresKicker}</Kicker>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{L.featuresTitle}</h2>
          </motion.div>

          <div className="mt-20 space-y-28">
            {(["summary", "flashcards", "test", "chat"] as const).map((k, i) => {
              const f = L.features[k];
              const { icon: Icon, gradient } = FEATURE_ICON[k];
              return (
                <div key={k} className="grid items-center gap-12 lg:grid-cols-2">
                  <motion.div {...reveal} className={clsx(i % 2 === 1 && "lg:order-2")}>
                    <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                      <Icon size={26} />
                    </span>
                    <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">{f.title}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-slate-500">{f.text}</p>
                    <ul className="mt-6 space-y-3">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 text-slate-700">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                            <Check size={14} strokeWidth={3} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.15 }} className={clsx(i % 2 === 1 && "lg:order-1")}>
                    <FeatureIllustration type={k} />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="px-5 py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
            <Kicker>{L.howKicker}</Kicker>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{L.howTitle}</h2>
          </motion.div>
          <div className="relative mt-20 grid gap-10 md:grid-cols-3">
            <div className="absolute top-10 hidden h-0.5 w-full bg-gradient-to-r from-violet-200 via-fuchsia-300 to-amber-200 md:block" />
            {L.steps.map((s, i) => (
              <motion.div key={s.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.15 }} className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-xl shadow-violet-100 ring-1 ring-violet-100">
                  {s.emoji}
                  <span className="absolute -top-2 -end-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-500">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section id="for" className="px-5 pb-28 lg:px-8">
        <motion.div {...reveal} className="mx-auto max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50 px-6 py-16 text-center">
          <Kicker>{L.forKicker}</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{L.forTitle}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {L.audiences.map((a, i) => (
              <motion.span
                key={a}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, rotate: -2 }}
                className="rounded-2xl bg-white px-5 py-3 text-lg font-semibold text-slate-700 shadow-md shadow-violet-100"
              >
                {a}
              </motion.span>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <MockChat />
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 lg:px-8">
        <motion.div
          {...reveal}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#0e0a1f] px-6 py-20 text-center text-white"
        >
          <div className="absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-violet-600/50 blur-[100px]" />
          <div className="absolute -bottom-24 end-1/4 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-[100px]" />
          <div className="relative">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{L.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">{L.ctaSub}</p>
            <Link
              href="/signup"
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-violet-700 transition hover:scale-105"
            >
              {L.ctaPrimary}
              <Arrow size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-400">
        <span className="font-bold text-violet-600">STUS</span>
      </footer>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-semibold text-violet-700">{children}</span>
  );
}

function Nav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "bg-white/80 shadow-sm backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg">🎓</span>
          <span className={clsx("text-xl font-extrabold", scrolled ? "text-slate-900" : "text-white")}>STUS</span>
        </Link>
        <div className={clsx("hidden flex-1 gap-6 text-sm font-medium md:flex", scrolled ? "text-slate-600" : "text-slate-300")}>
          <a href="#features" className="hover:text-violet-500">{t.landing.nav.features}</a>
          <a href="#how" className="hover:text-violet-500">{t.landing.nav.how}</a>
          <a href="#for" className="hover:text-violet-500">{t.landing.nav.forWho}</a>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <LangToggle />
          <Link
            href="/login"
            className={clsx(
              "hidden rounded-xl px-4 py-2 text-sm font-semibold sm:block",
              scrolled ? "text-slate-700 hover:bg-violet-50" : "text-white hover:bg-white/10",
            )}
          >
            {t.landing.nav.login}
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md"
          >
            {t.landing.nav.start}
          </Link>
        </div>
      </div>
    </nav>
  );
}
