import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { anthropic, checkStop, FALLBACK, MODEL, toHttpError } from "@/lib/ai/client";
import { loadContext } from "@/lib/ai/context";
import { saveProduct } from "@/lib/ai/save";

export const maxDuration = 300;

const body = z.object({
  courseId: z.uuid(),
  materialIds: z.array(z.uuid()).min(1),
  options: z.object({
    style: z.enum(["short", "keywords", "detailed"]),
    notes: z.string().max(2000).optional(),
  }),
});

const STYLE_INSTRUCTIONS = {
  short:
    "Write a SHORT summary: a 2–3 sentence overview, then 5–8 bullet points with the most important ideas. Aim for well under one page.",
  keywords:
    "List ONLY the key words and terms. Group them under a few headings by topic. For each term give a very short definition (max one line), with the term in bold. No long paragraphs.",
  detailed:
    "Write a DETAILED, well-structured summary that a student could study from: an overview, then a section per major topic with headings, explanations, definitions, formulas or examples where relevant, and a short 'Key takeaways' list at the end.",
};

export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { courseId, materialIds, options } = parsed.data;

  try {
    const ctx = await loadContext(supabase, user.id, courseId, materialIds);
    const notes = options.notes?.trim();

    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: options.style === "detailed" ? "medium" : "low" },
      system: ctx.system,
      messages: [
        {
          role: "user",
          content: `${ctx.materialText}

${STYLE_INSTRUCTIONS[options.style]}
${notes ? `\nThe student added this request — follow it:\n<student_notes>${notes}</student_notes>\n` : ""}
Format the answer in Markdown. Start with a single line "# <short title for this summary>".`,
        },
      ],
    });
    checkStop(response.stop_reason);

    const markdown = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    const titleMatch = /^#\s+(.+)$/m.exec(markdown);
    const title = titleMatch?.[1].trim().slice(0, 120) || ctx.materials[0].title;
    const body = titleMatch ? markdown.replace(titleMatch[0], "").trim() : markdown;

    const product = await saveProduct(supabase, {
      course_id: courseId,
      type: "summary",
      title,
      options,
      content: { markdown: body },
      material_ids: materialIds,
    });
    return NextResponse.json({ product });
  } catch (err) {
    const { message, status } = toHttpError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
