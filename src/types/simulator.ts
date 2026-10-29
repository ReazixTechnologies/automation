import type { ChatVariant, MessageStatus } from "./chat";
import type { ConfigurationId, VisitSlot } from "@/data/projectKnowledge";

export type Channel = ChatVariant;

export interface LeadState {
  name?: string;
  configuration?: string;
  budget?: string;
  timeline?: string;
  purpose?: string;
  visitSlot?: string;
  /** 0–100, set by the AI via capture_lead. */
  score: number;
}

export type LeadField = Exclude<keyof LeadState, "score">;

export interface UnitCardData {
  id: ConfigurationId;
  label: string;
  startingPrice: string;
  carpetSqft: number;
  superBuiltUpSqft: number;
  unitsLeft: number;
  highlights: string;
  gradient: string;
}

/**
 * Events streamed from /api/chat to the browser, one JSON object per SSE
 * `data:` line. Rich cards are built server-side from projectKnowledge so the
 * model never supplies the numbers shown on them.
 */
export type ChatStreamEvent =
  | { type: "meta"; mode: "live" | "offline" }
  | { type: "text"; delta: string }
  | { type: "units"; units: UnitCardData[] }
  | { type: "pdf"; configuration: string; name: string; pages: number; size: string }
  | { type: "slots"; slots: VisitSlot[] }
  | { type: "location"; name: string; address: string; hours: string }
  | { type: "lead"; fields: Partial<Omit<LeadState, "score">>; score?: number }
  | { type: "handoff"; reason: string; agent: string; team: string; reply: string }
  | { type: "suggestions"; options: string[] }
  | { type: "notice"; text: string }
  | { type: "done" };

export interface QuotedMessage {
  author: string;
  text: string;
}

/** Items rendered in the phone. Any item can carry emoji reactions. */
export type ChatItem = (
  | {
      id: string;
      kind: "text";
      role: "user" | "assistant";
      text: string;
      timestamp: string;
      status?: MessageStatus;
      streaming?: boolean;
      /** Swipe-to-reply quote shown inside the bubble. */
      quote?: QuotedMessage;
    }
  | { id: string; kind: "units"; units: UnitCardData[]; timestamp: string }
  | { id: string; kind: "pdf"; configuration: string; name: string; pages: number; size: string; timestamp: string }
  | { id: string; kind: "slots"; slots: VisitSlot[]; timestamp: string }
  | { id: string; kind: "location"; name: string; address: string; hours: string; timestamp: string }
  | { id: string; kind: "handoff"; agent: string; team: string; reply: string; timestamp: string }
  | { id: string; kind: "notice"; text: string }
  /** Native interactive message with reply buttons (client-generated, never from the model). */
  | { id: string; kind: "interactive"; text: string; buttons: { id: string; label: string }[]; selectedId?: string; timestamp: string }
  /** CTA URL button message. */
  | { id: string; kind: "cta"; text: string; label: string; url: string; timestamp: string }
) & {
  reactions?: string[];
  /** Created in the browser (e.g. the Reazix contact flow); never sent to the model. */
  local?: boolean;
};

/** Plain-text history sent to the server. */
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FeedEntry {
  id: string;
  text: string;
  tone: "intent" | "action" | "score" | "system";
  at: string;
}
