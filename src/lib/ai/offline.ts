/**
 * Offline demo mode: keyword matching over projectKnowledge, emitting the
 * same stream events as the live model so the UI is identical. Used when
 * ANTHROPIC_API_KEY is missing or the API fails.
 */
import { configurations, faqs, getOfferedSlots, type ConfigurationId } from "@/data/projectKnowledge";
import type { ChatStreamEvent } from "@/types/simulator";
import { floorPlanEvent, handoffEvent, locationEvent, toUnitCard } from "./tools";

const has = (text: string, words: string[]) => words.some((w) => new RegExp(`(^|[^\\p{L}])${w}`, "iu").test(text));

function detectConfig(text: string): ConfigurationId | undefined {
  if (/\b4\s?bhk|penthouse/i.test(text)) return "4bhk";
  if (/\b3\s?bhk/i.test(text)) return "3bhk";
  if (/\b2\s?bhk/i.test(text)) return "2bhk";
  return undefined;
}

export function offlineReply(userText: string): ChatStreamEvent[] {
  const text = userText.toLowerCase();
  const out: ChatStreamEvent[] = [];
  const say = (t: string) => out.push({ type: "text", delta: t });
  const config = detectConfig(text);
  const label = config && configurations.find((c) => c.id === config)!.label;

  // A tapped slot comes back as its label, e.g. "Thu, 29 Oct · 11:00 AM".
  const slot = getOfferedSlots().find((s) => text.includes(s.label.toLowerCase()));
  if (slot) {
    say(`Wonderful, your visit is booked for ${slot.label} ✅ Here's how to reach us.`);
    out.push({ type: "lead", fields: { visitSlot: slot.label }, score: 85 });
    out.push(locationEvent());
    out.push({ type: "suggestions", options: ["Send floor plan", "Payment plan?"] });
    return out;
  }

  if (has(text, ["who built", "who made", "who created", "reazix", "built this", "get one", "for my project", "for my business", "my own", "your company"])) {
    say("This concierge is a demo built by Reazix, a digital product studio that builds WhatsApp & Instagram AI concierges for real estate. ✨");
    out.push(handoffEvent("visitor wants a concierge for their own business", "reazix"));
    return out;
  }

  if (has(text, ["human", "agent", "advisor", "person", "call me", "talk to", "discount", "offer"])) {
    say("Let me connect you with an advisor who can help with that. 🙌");
    out.push(handoffEvent("visitor asked for a person"));
    return out;
  }

  if (has(text, ["floor plan", "floorplan", "layout", "view floor plan"])) {
    const id = config ?? "3bhk";
    say(`Here's the ${configurations.find((c) => c.id === id)!.label} floor plan 📐`);
    out.push(floorPlanEvent(id));
    out.push({ type: "lead", fields: { configuration: configurations.find((c) => c.id === id)!.label }, score: 45 });
    out.push({ type: "suggestions", options: ["Book a site visit", "Payment plan?"] });
    return out;
  }

  if (has(text, ["visit", "tour", "book", "appointment"])) {
    say("I'd love to show you around! Pick a slot that suits you 🗓️");
    out.push({ type: "slots", slots: getOfferedSlots() });
    out.push({ type: "lead", fields: {}, score: 60 });
    return out;
  }

  if (config || has(text, ["price", "cost", "bhk", "configuration", "kitna", "rate"])) {
    say(config ? `Great choice! Here are the ${label} details 👇` : "Here are our homes at Skyline Heights 👇");
    out.push({ type: "units", units: (config ? [config] : configurations.map((c) => c.id)).map(toUnitCard) });
    out.push({ type: "lead", fields: config ? { configuration: label } : {}, score: config ? 40 : 25 });
    say(" Which one suits your family best?");
    out.push({ type: "suggestions", options: ["Send floor plan", "Book a site visit"] });
    return out;
  }

  if (has(text, ["location", "where", "address", "direction", "map"])) {
    say("We're on Lakeside Avenue, Sector 21. Here's the Experience Centre 📍");
    out.push(locationEvent());
    return out;
  }

  const faq = faqs.find((f) => has(text, f.keywords));
  if (faq) {
    say(faq.answer);
    out.push({ type: "suggestions", options: ["3 BHK price?", "Book a site visit"] });
    return out;
  }

  say("I don't have that detail right now. Would you like me to connect you with an advisor?");
  out.push({ type: "suggestions", options: ["Talk to an advisor", "Show me amenities"] });
  return out;
}
