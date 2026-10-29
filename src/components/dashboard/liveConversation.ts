import { leadTags } from "@/components/simulator/LeadCard";
import { currentAgentId, type Conversation, type DemoMessage, type TimelineEvent } from "@/data/dashboardDemo";
import type { Channel, ChatItem, LeadState } from "@/types/simulator";

export const LIVE_CONVERSATION_ID = "live";

const tagNames: Record<string, string> = { "Hot Lead": "Hot", "Site Visit Booked": "Site Visit" };

/**
 * The visitor's own live-demo chat, shaped as a dashboard lead. Returns null
 * until they have sent at least one message.
 */
export function liveDemoConversation(items: ChatItem[], lead: LeadState, channel: Channel): Conversation | null {
  const texts = items.filter((i): i is Extract<ChatItem, { kind: "text" }> => i.kind === "text");
  if (!texts.some((t) => t.role === "user")) return null;

  const messages: DemoMessage[] = [];
  for (const item of items) {
    const time = "timestamp" in item ? item.timestamp : "";
    switch (item.kind) {
      case "text":
        if (item.text) messages.push({ id: item.id, from: item.role === "user" ? "lead" : "ai", text: item.text, time });
        break;
      case "units":
        messages.push({ id: item.id, from: "ai", text: `📋 Sent unit cards: ${item.units.map((u) => u.label).join(", ")}`, time });
        break;
      case "pdf":
        messages.push({ id: item.id, from: "ai", text: "", time, attachment: { name: item.name, meta: `${item.pages} pages • PDF` } });
        break;
      case "slots":
        messages.push({ id: item.id, from: "ai", text: "🗓️ Offered site visit slots", time });
        break;
      case "location":
        messages.push({ id: item.id, from: "ai", text: `📍 Shared location: ${item.name}`, time });
        break;
      case "handoff":
        messages.push({ id: item.id, from: "agent", agentId: currentAgentId, text: item.reply, time });
        break;
    }
  }

  const lastUser = [...texts].reverse().find((t) => t.role === "user");
  const timeline: TimelineEvent[] = [{ label: "Chatted with the AI concierge in the live demo", time: texts[0]?.timestamp ?? "", kind: "chat" }];
  if (items.some((i) => i.kind === "pdf")) timeline.push({ label: "Floor plan auto-sent", time: "", kind: "brochure" });
  if (lead.visitSlot) timeline.push({ label: `Visit booked: ${lead.visitSlot}`, time: "", kind: "visit" });
  if (lead.score) timeline.push({ label: `AI intent score ${lead.score}`, time: "", kind: "score" });

  return {
    id: LIVE_CONVERSATION_ID,
    live: true,
    name: "You (Live Demo)",
    initials: "You",
    channel,
    handle: lead.name ? `Name captured: ${lead.name}` : channel === "whatsapp" ? "WhatsApp" : "Instagram DM",
    lastMessage: messages[messages.length - 1]?.text || "📎 Attachment",
    time: lastUser?.timestamp ?? "now",
    unread: 0,
    score: lead.score,
    tags: leadTags(lead).map((t) => tagNames[t] ?? t),
    agentId: currentAgentId,
    configuration: lead.configuration ?? "Not shared yet",
    budget: lead.budget ?? "Not shared yet",
    source: "Live demo · this page",
    timeline,
    messages,
  };
}
