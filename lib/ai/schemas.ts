import { z } from "zod";

export const flashcardsSchema = z.object({
  title: z.string().describe("Short title for this deck, in the material's language"),
  cards: z.array(
    z.object({
      front: z.string().describe("Term or question"),
      back: z.string().describe("Definition or answer, concise"),
    }),
  ),
});

export const testSchema = z.object({
  title: z.string().describe("Short title for this test, in the material's language"),
  questions: z.array(
    z.object({
      kind: z.enum(["yesno", "mc", "open"]),
      question: z.string(),
      options: z
        .array(z.string())
        .describe('For "mc": exactly 4 options. For "yesno": ["Yes","No"] in the material language. For "open": empty.'),
      answer: z
        .string()
        .describe('For "mc"/"yesno": the exact text of the correct option. For "open": a model answer.'),
      explanation: z.string().describe("One or two sentences explaining the answer"),
    }),
  ),
});

export const gradeSchema = z.object({
  results: z.array(
    z.object({
      correct: z.boolean(),
      feedback: z.string().describe("One or two encouraging sentences on what was right or missing"),
    }),
  ),
});
