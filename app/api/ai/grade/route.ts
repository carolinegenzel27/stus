import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getUser } from "@/lib/supabase/server";
import { anthropic, checkStop, FALLBACK, MODEL, toHttpError } from "@/lib/ai/client";
import { gradeSchema } from "@/lib/ai/schemas";
import { LANGUAGE_RULE, outputLanguage } from "@/lib/ai/context";
import type { TestContent, TestResult } from "@/lib/types";

export const maxDuration = 300;

const body = z.object({
  productId: z.uuid(),
  answers: z.array(z.string().max(5000)),
});

export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { productId, answers } = parsed.data;

  const { data: product } = await supabase
    .from("products")
    .select("id, type, content")
    .eq("id", productId)
    .single();
  if (!product || product.type !== "test") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = product.content as TestContent;
  const { questions } = content;
  if (answers.length !== questions.length) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

  try {
    const correct: boolean[] = [];
    const feedback: string[] = [];
    const openIdx: number[] = [];

    questions.forEach((q, i) => {
      if (q.kind === "open") {
        openIdx.push(i);
        correct.push(false);
        feedback.push("");
      } else {
        const ok = answers[i].trim() === q.answer.trim();
        correct.push(ok);
        feedback.push(q.explanation);
      }
    });

    if (openIdx.length) {
      const items = openIdx
        .map(
          (i, n) => `<item n="${n + 1}">
<question>${questions[i].question}</question>
<model_answer>${questions[i].answer}</model_answer>
<student_answer>${answers[i] || "(empty)"}</student_answer>
</item>`,
        )
        .join("\n");

      const response = await anthropic.beta.messages.parse({
        model: MODEL,
        max_tokens: 8000,
        ...FALLBACK,
        output_config: { effort: "low", format: betaZodOutputFormat(gradeSchema) },
        system: `You grade a student's answers to open study questions against a model answer. Mark an answer correct if it captures the essential idea, even if worded differently, in another language, or less complete. ${LANGUAGE_RULE(await outputLanguage())}`,
        messages: [
          {
            role: "user",
            content: `Grade these ${openIdx.length} answers, returning results in the same order.\n\n${items}`,
          },
        ],
      });
      checkStop(response.stop_reason);
      const results = response.parsed_output?.results ?? [];
      openIdx.forEach((qi, n) => {
        correct[qi] = results[n]?.correct ?? false;
        feedback[qi] = results[n]?.feedback ?? questions[qi].explanation;
      });
    }

    const result: TestResult = {
      answers,
      correct,
      feedback,
      score: Math.round((correct.filter(Boolean).length / questions.length) * 100),
      submitted_at: new Date().toISOString(),
    };
    await supabase
      .from("products")
      .update({ content: { ...content, result } })
      .eq("id", productId);
    return NextResponse.json({ result });
  } catch (err) {
    const { message, status } = toHttpError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
