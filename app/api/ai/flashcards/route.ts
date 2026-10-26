import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getUser } from "@/lib/supabase/server";
import { AiError, anthropic, checkStop, FALLBACK, MODEL, toHttpError } from "@/lib/ai/client";
import { loadContext } from "@/lib/ai/context";
import { flashcardsSchema } from "@/lib/ai/schemas";
import { saveProduct } from "@/lib/ai/save";

export const maxDuration = 300;

const body = z.object({
  courseId: z.uuid(),
  materialIds: z.array(z.uuid()).min(1),
  options: z.object({
    target: z.string().max(1000).optional(),
    count: z.number().int().min(1).max(30),
  }),
});

export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { courseId, materialIds, options } = parsed.data;

  try {
    const ctx = await loadContext(supabase, user.id, courseId, materialIds);
    const target = options.target?.trim();

    const response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: "low", format: betaZodOutputFormat(flashcardsSchema) },
      system: ctx.system,
      messages: [
        {
          role: "user",
          content: `${ctx.materialText}

Create exactly ${options.count} flashcards from these materials.
${
  target
    ? `Focus the cards on what the student asked for:\n<student_focus>${target}</student_focus>`
    : "Base the cards on the most important key terms and concepts."
}
Each card: a short term or question on the front, a clear and concise answer on the back. No duplicates.`,
        },
      ],
    });
    checkStop(response.stop_reason);
    const out = response.parsed_output;
    if (!out?.cards.length) throw new AiError("Could not create flashcards. Try again.", 502);

    const product = await saveProduct(supabase, {
      course_id: courseId,
      type: "flashcards",
      title: out.title.slice(0, 120),
      options,
      content: { cards: out.cards.slice(0, options.count) },
      material_ids: materialIds,
    });
    return NextResponse.json({ product });
  } catch (err) {
    const { message, status } = toHttpError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
