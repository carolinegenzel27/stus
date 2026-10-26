import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { getUser } from "@/lib/supabase/server";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_CHARS = 1_000_000;

/** Accepts multipart form: courseId + (file | title & text). */
export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const courseId = String(form.get("courseId") ?? "");
  const file = form.get("file");

  const { data: course } = await supabase.from("courses").select("id").eq("id", courseId).single();
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  let title: string;
  let kind: "pdf" | "txt" | "text";
  let content: string;
  let storagePath: string | null = null;

  if (file instanceof File) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 10 MB" }, { status: 413 });
    const name = file.name.toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    title = file.name.replace(/\.(pdf|txt|md)$/i, "");

    if (name.endsWith(".pdf")) {
      kind = "pdf";
      try {
        const pdf = await getDocumentProxy(bytes);
        const { text } = await extractText(pdf, { mergePages: true });
        content = text;
      } catch {
        return NextResponse.json({ error: "Could not read this PDF" }, { status: 422 });
      }
    } else if (name.endsWith(".txt") || name.endsWith(".md")) {
      kind = "txt";
      content = new TextDecoder().decode(bytes);
    } else {
      return NextResponse.json({ error: "Only PDF and TXT files are supported" }, { status: 415 });
    }

    content = content.trim();
    if (content.length < 20) {
      return NextResponse.json(
        { error: "No text found in this file (scanned PDFs are not supported yet)" },
        { status: 422 },
      );
    }

    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    storagePath = `${user.id}/${courseId}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("materials")
      .upload(storagePath, bytes, { contentType: file.type || "application/octet-stream" });
    if (upErr) storagePath = null; // the extracted text is what matters; keep going
  } else {
    kind = "text";
    content = String(form.get("text") ?? "").trim();
    title = String(form.get("title") ?? "").trim() || content.slice(0, 40);
    if (!content) return NextResponse.json({ error: "Text is empty" }, { status: 400 });
  }

  if (content.length > MAX_CHARS) {
    return NextResponse.json({ error: "This material is too long (max ~1M characters)" }, { status: 413 });
  }

  const { data, error } = await supabase
    .from("materials")
    .insert({
      course_id: courseId,
      title: title.slice(0, 200),
      kind,
      content,
      storage_path: storagePath,
      char_count: content.length,
    })
    .select("id, course_id, title, kind, char_count, selected, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ material: data });
}
