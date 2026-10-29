import type { ReactNode, RefObject, UIEvent } from "react";
import type { DemoProject } from "@/data/projects";
import type { ChatItem, QuotedMessage } from "@/types/simulator";

/** Everything a channel view (WhatsApp / Instagram) needs; logic lives in DemoChat. */
export interface DemoViewProps {
  project: DemoProject;
  items: ChatItem[];
  isTyping: boolean;
  isBusy: boolean;
  /** Starters / AI suggestions, shown as native reply buttons or ice-breakers. */
  suggestions: string[];
  /** False while the static shell renders (before the conversation mounts). */
  live: boolean;
  reducedMotion: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  onListScroll: (e: UIEvent<HTMLDivElement>) => void;
  scrollButton: ReactNode;
  poweredBy: ReactNode;
  quote: QuotedMessage | null;
  onClearQuote: () => void;
  /** Tap on a suggestion or button that sends text. */
  onSend: (text: string) => void;
  /** Composer submit (includes the active reply quote). */
  onComposerSend: (text: string) => void;
  onInteractive: (item: Extract<ChatItem, { kind: "interactive" }>, buttonId: string) => void;
  onReplyTo: (item: ChatItem) => void;
  onActions: (item: ChatItem, rect: DOMRect, align: "start" | "end") => void;
  onReact: (item: ChatItem, emoji: string) => void;
  onOpenImage: (img: { title: string; caption?: string; background: string }) => void;
  onOpenSlots: (item: Extract<ChatItem, { kind: "slots" }>) => void;
  onLocation: () => void;
  onHeaderAction: (action: "call" | "video" | "menu") => void;
  menuOpen: boolean;
  onClearChat: () => void;
  onRestart: () => void;
}
