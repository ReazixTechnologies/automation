import { demoLeadSchema, leadSchema } from "@/lib/leadSchema";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Lead capture endpoint. Validates with the same schema as the form.
 * TODO(launch): forward valid leads to the CRM / email (see LAUNCH_CHECKLIST.md).
 * Logs event metadata only, never the visitor's personal details.
 */
export async function POST(req: Request) {
  const limit = checkRateLimit(`lead:${clientIp(req.headers)}`);
  if (!limit.ok) return Response.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Short lead from the in-chat flow on /demo pages.
  if ((body as { source?: unknown })?.source === "demo-chat") {
    const demo = demoLeadSchema.safeParse(body);
    if (!demo.success) {
      return Response.json({ ok: false, error: demo.error.issues[0]?.message ?? "Invalid details" }, { status: 422 });
    }
    if (demo.data.website) return Response.json({ ok: true });
    console.info(JSON.stringify({ scope: "lead", event: "demo_lead_received", intent: demo.data.intent, channel: demo.data.channel }));
    return Response.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  // Honeypot filled: answer like a success so bots learn nothing.
  if (parsed.data.website) {
    console.info(JSON.stringify({ scope: "lead", event: "honeypot" }));
    return Response.json({ ok: true });
  }

  console.info(JSON.stringify({ scope: "lead", event: "lead_received", monthlyLeads: parsed.data.monthlyLeads, country: parsed.data.countryCode }));
  return Response.json({ ok: true });
}
