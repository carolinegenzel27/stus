import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();
export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

/**
 * Shared request options: on a policy decline the API retries on the model's
 * server-defined fallback inside the same call.
 */
export const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default" as const,
};

/** Rough upper bound on material text per request (~600k tokens). */
export const MAX_MATERIAL_CHARS = 2_000_000;

export class AiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

export function checkStop(stopReason: string | null) {
  if (stopReason === "refusal") throw new AiError("Claude declined to process this material.", 422);
  if (stopReason === "max_tokens") throw new AiError("The response was too long. Try fewer items.", 422);
}

export function toHttpError(err: unknown) {
  if (err instanceof AiError) return { message: err.message, status: err.status };
  if (err instanceof Anthropic.RateLimitError) return { message: "Too many requests, try again in a minute.", status: 429 };
  if (err instanceof Anthropic.AuthenticationError) return { message: "AI is not configured (check ANTHROPIC_API_KEY).", status: 500 };
  if (err instanceof Anthropic.APIError) return { message: `AI error: ${err.message}`, status: 502 };
  console.error(err);
  return { message: "Unexpected error", status: 500 };
}
