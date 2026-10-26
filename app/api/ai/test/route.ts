import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getUser } from "@/lib/supabase/server";
import { AiError, anthropic, checkStop, FALLBACK, MODEL, toHttpError } from "@/lib/ai/client";
import { loadContext } from "@/lib/ai/context";
import { consumeCredit } from "@/lib/ai/limit";
import { testSchema } from "@/lib/ai/schemas";
import { saveProduct } from "@/lib/ai/save";

export const maxDuration = 300;

const body = z.object({
  courseId: z.uuid(),
  materialIds: z.array(z.uuid()).min(1),
  options: z.object({
    count: z.union([z.literal(5), z.literal(10), z.literal(20)]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    kinds: z.array(z.enum(["yesno", "mc", "open"])).min(1),
  }),
});

const KIND_LABEL = {
  yesno: '"yesno" (a statement or question answered Yes or No)',
  mc: '"mc" (multiple choice with exactly 4 options, one correct)',
  open: '"open" (open question answered in a few sentences)',
};

const DIFFICULTY = {
  easy: "EASY: direct recall of definitions and basic facts.",
  medium: "MEDIUM: understanding and applying the concepts.",
  hard: "HARD: analysis, edge cases, connecting several concepts; plausible distractors.",
};

export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { courseId, materialIds, options } = parsed.data;

  try {
    const ctx = await loadContext(supabase, user.id, courseId, materialIds);
    const remaining = await consumeCredit(supabase);

    const response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: "medium", format: betaZodOutputFormat(testSchema) },
      system: ctx.system,
      messages: [
        {
          role: "user",
          content: `${ctx.materialText}

Write a test with exactly ${options.count} questions on these materials.
Difficulty — ${DIFFICULTY[options.difficulty]}
Use only these question types, spread roughly evenly: ${options.kinds.map((k) => KIND_LABEL[k]).join(", ")}.
Cover different parts of the material. For multiple choice, vary the position of the correct option.`,
        },
      ],
    });
    checkStop(response.stop_reason);
    const out = response.parsed_output;
    const questions = (out?.questions ?? [])
      .filter((q) => options.kinds.includes(q.kind))
      .map((q) => (q.kind === "open" ? { ...q, options: [] } : q));
    if (!out || !questions.length) throw new AiError("Could not create a test. Try again.", 502);

    const product = await saveProduct(supabase, {
      course_id: courseId,
      type: "test",
      title: out.title.slice(0, 120),
      options,
      content: { questions: questions.slice(0, options.count) },
      material_ids: materialIds,
    });
    return NextResponse.json({ product, remaining });
  } catch (err) {
    const { message, status, code } = toHttpError(err);
    return NextResponse.json({ error: message, code }, { status });
  }
}
