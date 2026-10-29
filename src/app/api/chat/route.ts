import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AI_CONFIG, CHAT_LIMITS } from "@/lib/ai/config";
import { offlineReply } from "@/lib/ai/offline";
import { getSystemPrompt } from "@/lib/ai/systemPrompt";
import { runTool, TOOLS } from "@/lib/ai/tools";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import type { ChatStreamEvent } from "@/types/simulator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(CHAT_LIMITS.maxAssistantChars),
      }),
    )
    .min(1)
    .max(CHAT_LIMITS.maxUserMessages * 4),
  /** Demo project id (?project= on /demo pages); unknown ids use the default. */
  project: z
    .string()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional(),
});

const isProd = process.env.NODE_ENV === "production";

/** Event-type and count logging only; message content is never logged. */
function logEvent(data: Record<string, unknown>) {
  console.info(JSON.stringify({ scope: "chat", ...data }));
}

let client: Anthropic | null = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey, maxRetries: 1, timeout: 30_000 });
  return client;
}

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const userMessages = body.messages.filter((m) => m.role === "user");
  const latest = body.messages[body.messages.length - 1];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      const finish = (notice?: string) => {
        if (notice) send({ type: "notice", text: notice });
        send({ type: "done" });
        controller.close();
      };

      // Friendly in-chat messages for every limit.
      if (latest.role !== "user" || !latest.content.trim()) return finish("Please type a message to continue.");
      if (latest.content.length > CHAT_LIMITS.maxMessageChars) {
        return finish(`Messages are limited to ${CHAT_LIMITS.maxMessageChars} characters in this demo.`);
      }
      if (userMessages.length > CHAT_LIMITS.maxUserMessages) {
        return finish("You've reached the demo's message limit. Tap restart to begin a new conversation. 🙏");
      }
      const limit = checkRateLimit(clientIp(req.headers));
      if (!limit.ok) {
        logEvent({ event: "rate_limited", window: limit.scope });
        return finish(
          limit.scope === "minute"
            ? "You're typing faster than our concierge! Please wait a few seconds and try again."
            : "You've used today's demo allowance. Please come back tomorrow, or book a real demo with our team.",
        );
      }

      const history = toModelHistory(body.messages);
      const anthropic = getClient();
      let streamedAnything = false;

      const runOffline = async (reason: string) => {
        send({ type: "meta", mode: "offline" });
        logEvent({ event: "offline_reply", reason, turns: userMessages.length });
        for (const event of offlineReply(latest.content)) {
          if (event.type === "text") {
            // Simulate token streaming so offline mode feels the same.
            for (const word of event.delta.split(/(\s+)/)) {
              send({ type: "text", delta: word });
              await new Promise((r) => setTimeout(r, 18));
            }
          } else {
            send(event);
          }
        }
        finish();
      };

      if (!anthropic) return runOffline("no_api_key");

      send({ type: "meta", mode: "live" });
      const toolsUsed: string[] = [];
      try {
        const messages: Anthropic.MessageParam[] = history;
        for (let i = 0; i < AI_CONFIG.maxToolIterations; i++) {
          const s = anthropic.messages.stream(
            {
              model: AI_CONFIG.model,
              max_tokens: AI_CONFIG.maxTokens,
              system: [{ type: "text", text: getSystemPrompt(body.project), cache_control: { type: "ephemeral" } }],
              tools: TOOLS,
              output_config: { effort: AI_CONFIG.effort },
              messages,
            },
            { signal: req.signal },
          );
          s.on("text", (delta) => {
            streamedAnything = true;
            send({ type: "text", delta });
          });

          const message = await s.finalMessage();
          if (message.stop_reason === "refusal") {
            return finish(streamedAnything ? undefined : "I can only help with questions about Skyline Heights. 🏡");
          }

          const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          if (toolUses.length === 0) break;
          // A tool input cut off at max_tokens can still look valid; don't run it.
          if (message.stop_reason === "max_tokens") break;

          // Append the assistant turn unchanged (thinking blocks included).
          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.ToolResultBlockParam[] = [];
          let handedOff = false;
          for (const call of toolUses) {
            const outcome = runTool(call.name, call.input);
            toolsUsed.push(call.name);
            if (outcome.event) {
              streamedAnything = true;
              send(outcome.event);
            }
            if (call.name === "handoff_to_human" && !outcome.isError) handedOff = true;
            results.push({ type: "tool_result", tool_use_id: call.id, content: outcome.result, is_error: outcome.isError });
          }
          // A human has taken over; the bot stops talking this turn.
          if (handedOff) break;
          messages.push({ role: "user", content: results });
        }
        logEvent({ event: "live_reply", turns: userMessages.length, tools: toolsUsed });
        finish();
      } catch (err) {
        if (req.signal.aborted) return controller.close();
        const kind = err instanceof Anthropic.APIError ? `api_${err.status ?? "error"}` : "unknown";
        logEvent({ event: "api_error", kind, ...(isProd ? {} : { message: String(err) }) });
        // Fall back if nothing reached the visitor yet; otherwise end politely.
        if (!streamedAnything) return runOffline(kind);
        finish("Sorry, I lost my connection for a moment. Could you send that again?");
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Trim to the last N messages, start on a user turn, and merge same-role runs. */
function toModelHistory(messages: z.infer<typeof BodySchema>["messages"]): Anthropic.MessageParam[] {
  const recent = messages.slice(-CHAT_LIMITS.historyMessages);
  const firstUser = recent.findIndex((m) => m.role === "user");
  const out: Anthropic.MessageParam[] = [];
  for (const m of recent.slice(firstUser)) {
    const content = m.role === "user" ? m.content.slice(0, CHAT_LIMITS.maxMessageChars) : m.content;
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content = `${prev.content as string}\n${content}`;
    else out.push({ role: m.role, content });
  }
  return out;
}
