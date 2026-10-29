/** Shared chat types used by ChatBubble, TypingIndicator, ChatHeader and useScriptPlayer. */

export type ChatVariant = "whatsapp" | "instagram";
export type ChatSender = "bot" | "user";
export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatAttachment {
  type: "pdf" | "image" | "doc";
  name: string;
  /** Secondary line, e.g. "2 pages • 1.4 MB". */
  meta?: string;
  /** For image attachments: CSS background (gradient/url). Images are optional. */
  preview?: string;
}

export interface QuickReply {
  id: string;
  label: string;
}

export interface ScriptSlot {
  id: string;
  label: string;
  day: string;
  date: string;
  time: string;
}

export interface CatalogUnit {
  id: string;
  name: string;
  detail: string;
  price: string;
  gradient: string;
}

/** Rich content a scripted message can carry; ScriptedPhone maps each to a component. */
export type ScriptCard =
  | { type: "pdf"; name: string; meta: string; verified?: boolean }
  | { type: "location"; title: string; address: string }
  | { type: "slots"; slots: ScriptSlot[] }
  | { type: "catalog"; units: CatalogUnit[]; more: number }
  | { type: "payment"; milestone: string; amount: string; due: string; unit: string }
  | { type: "receipt"; amount: string; reference: string; milestone: string };

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text?: string;
  timestamp?: string;
  /** Delivery ticks; rendered for user (outgoing) messages. */
  status?: MessageStatus;
  attachments?: ChatAttachment[];
  quickReplies?: QuickReply[];
  card?: ScriptCard;
  /** Small note under the bubble, e.g. "✨ AI replied in 0.8s". */
  tag?: string;
  author?: string;
  /** Render as a centered system line instead of a bubble. */
  system?: boolean;
}

export interface ScriptComment {
  id: string;
  author: string;
  text: string;
  /** Reply from the business account. */
  fromBusiness?: boolean;
}

/**
 * A scripted conversation is a list of events played in order.
 * `delay` is the wait (ms) before the event runs.
 */
export type ChatScriptEvent =
  | { type: "message"; message: ChatMessage; delay?: number }
  | { type: "typing"; sender?: ChatSender; duration: number; delay?: number }
  | { type: "select"; messageId: string; replyId: string; delay?: number }
  | { type: "toast"; text: string; delay?: number }
  | { type: "pause"; duration: number }
  /** Switch what the phone shows (e.g. an ad screen -> the chat), optionally its skin. */
  | { type: "scene"; scene: string; variant?: ChatVariant; delay?: number }
  /** Pulse a named control in a scene, e.g. an ad's "Send Message" button. */
  | { type: "press"; target: string; delay?: number }
  | { type: "score"; value: number; delay?: number }
  /** Jump the status-bar clock forward, showing `label` (e.g. "2 hours later"). */
  | { type: "clock"; time: string; label: string; delay?: number }
  | { type: "comment"; comment: ScriptComment; delay?: number };
