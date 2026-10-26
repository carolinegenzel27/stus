# STUS 🎓 — your AI private study assistant

Next.js 16 · TypeScript · Supabase · Claude · Vercel

Students sign up with a username + password, answer a short onboarding quiz, create courses
(with an emoji, or auto-named `course_1`, `course_2`, …), upload materials (PDF / TXT / pasted text)
and turn the selected materials into **summaries, flashcards, tests and chats**. Everything they
create is saved per course, grouped by date, and can be organized into folders. UI in English and
Hebrew (RTL).

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   It creates the tables, row-level security (each user only sees their own data) and a private
   `materials` storage bucket.
3. **Authentication → Sign In / Providers → Email**: turn **off** "Confirm email".
   (Usernames are mapped to hidden placeholder emails, so confirmation mails can't be delivered.)
4. **Project Settings → API**: copy the Project URL and the `anon` public key.

## 2. Get a Claude API key

Create a key at [console.anthropic.com](https://console.anthropic.com). The app uses
`claude-opus-5-5` by default; set `CLAUDE_MODEL` to use another model.

## 3. Run locally

```bash
cp .env.example .env.local   # then fill in the 3 values
npm install
npm run dev
```

Open http://localhost:3000 and sign up.

## 4. Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project**, import the repo. If `stus/` is a subfolder of the repo, set
   **Root Directory** to `stus`.
3. Add the environment variables from `.env.example`.
4. Deploy. AI routes allow up to 300s (`maxDuration`), which works with Vercel's fluid compute.

## Project layout

| Path | What it is |
| --- | --- |
| `proxy.ts`, `lib/supabase/` | Session refresh + redirects (login → onboarding → app) |
| `app/login`, `app/signup`, `app/onboarding` | Auth and the onboarding questions |
| `app/page.tsx`, `components/dashboard/` | Dashboard with courses |
| `app/courses/[id]`, `components/course/` | Course page: materials (right), actions (left), feed (middle) |
| `app/api/materials/upload` | PDF/TXT text extraction + storage |
| `app/api/ai/*`, `lib/ai/` | Claude calls: summarize, flashcards, test, grade, chat |
| `lib/i18n/` | English/Hebrew dictionaries and the language toggle |

## Notes

- Scanned PDFs (images only) have no text layer and are rejected; OCR is not included.
- Claude requests use server-side refusal fallbacks (`fallbacks: "default"`), so a rare policy decline
  is retried on a fallback model automatically.
- Cost: every action sends the selected materials to Claude. Selecting fewer/shorter materials is
  cheaper and faster. Chat caches the materials between turns.
