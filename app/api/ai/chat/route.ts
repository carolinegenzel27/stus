import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { anthropic, FALLBACK, MODEL, toHttpError } from "@/lib/ai/client";
import { loadContext } from "@/lib/ai/context";
import { consumeCredit } from "@/lib/ai/limit";
import { saveProduct } from "@/lib/ai/save";
import type { ChatContent, ChatMessage } from "@/lib/types";

export const maxDuration = 300;

const body = z.object({
  courseId: z.uuid(),
  materialIds: z.array(z.uuid()).min(1),
  productId: z.uuid().optional(),
  message: z.string().min(1).max(8000),
});

/**
 * Streams the assistant's reply as plain text. The chat is stored as a product;
 * a new chat's id is returned in the X-Product-Id header.
 */
export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { courseId, productId, message } = parsed.data;
  let { materialIds } = parsed.data;

  try {
    let history: ChatMessage[] = [];
    let id = productId;
    if (id) {
      const { data } = await supabase.from("products").select("content, material_ids").eq("id", id).single();
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      history = (data.content as ChatContent).messages ?? [];
      materialIds = data.material_ids;
    }

    const ctx = await loadContext(supabase, user.id, courseId, materialIds);
    const remaining = await consumeCredit(supabase);

    if (!id) {
      const product = await saveProduct(supabase, {
        course_id: courseId,
        type: "chat",
        title: message.slice(0, 80),
        options: {},
        content: { messages: [] },
        material_ids: materialIds,
      });
      id = product.id as string;
    }

    // Materials go in a stable first turn so the prefix is cached across chat turns.
    const stream = anthropic.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: "low" },
      system: `${ctx.system}\n\nYou are chatting with the student about their materials. Answer clearly and concisely; use examples and Markdown when helpful.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Here are my study materials:\n\n${ctx.materialText}`,
              cache_control: { type: "ephemeral" },
            },
          ],
        },
        { role: "assistant", content: "Got it — I've read your materials. What would you like to know?" },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();
    const chatId = id;
    const readable = new ReadableStream({
      async start(controller) {
        let reply = "";
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              reply += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal" && !reply) {
            reply = "Sorry, I can't help with that one.";
            controller.enqueue(encoder.encode(reply));
          }
          const messages: ChatMessage[] = [
            ...history,
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ];
          await supabase.from("products").update({ content: { messages } }).eq("id", chatId);
        } catch (err) {
          controller.enqueue(encoder.encode(`\n\n⚠️ ${toHttpError(err).message}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Product-Id": chatId,
        "X-AI-Remaining": String(remaining),
      },
    });
  } catch (err) {
    const { message: msg, status, code } = toHttpError(err);
    return NextResponse.json({ error: msg, code }, { status });
  }
}
